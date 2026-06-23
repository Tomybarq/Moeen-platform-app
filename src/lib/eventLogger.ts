import prisma from "./prisma";

/**
 * تسجيل الأحداث المنهجية (Audit Logging) بشكل غير معطل للتطبيق (Non-blocking)
 * @param eventType نوع الحدث (مثال: beneficiary.created)
 * @param payload البيانات الإضافية المرفقة بالحدث
 * @param userId معرف المستخدم الذي قام بالعملية (اختياري)
 */
export function logEvent(
  eventType: string,
  payload: unknown,
  userId?: number
): void {
  // تشغيل تسجيل الحدث بشكل غير متزامن في الخلفية لمنع تعطيل الـ API Flow
  Promise.resolve().then(async () => {
    try {
      let ipAddress: string | null = null;
      
      try {
        // محاولة استخراج عنوان الـ IP ديناميكياً في حال تم الاستدعاء في سياق طلب سيرفر
        const { headers } = await import("next/headers");
        const headersList = await headers();
        ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
        if (ipAddress && ipAddress.includes(",")) {
          ipAddress = ipAddress.split(",")[0].trim();
        }
      } catch {
        // في حال تم الاستدعاء خارج سياق طلب سيرفر (مثل عمليات بناء أو مهام خلفية)
      }

      await prisma.systemEvent.create({
        data: {
          eventType,
          userId: userId || null,
          payload: payload as any,
          ipAddress,
        },
      });
    } catch (error) {
      // طباعة الخطأ بشكل منظم ومحمي دون التسبب بانهيار السيرفر
      console.error("SystemEvent logging failed:", {
        eventType,
        userId,
        error: error instanceof Error ? error.message : error,
      });
    }
  });
}
