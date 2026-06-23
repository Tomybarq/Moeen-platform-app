import prisma from "./prisma";

interface SendMockNotificationParams {
  userId?: number | null; // المستخدم المستهدف (أو فارغ لجميع مستخدمي لوحة التحكم)
  title: string;          // العنوان بالإنجليزية
  titleAr?: string | null; // العنوان بالعربية
  message: string;        // نص التنبيه بالإنجليزية
  messageAr?: string | null; // نص التنبيه بالعربية
  type?: "info" | "success" | "warning" | "error"; // نوع التنبيه
  channels?: ("in-app" | "sms" | "email")[]; // القنوات المراد الرفع عليها
  recipientPhone?: string | null; // رقم الجوال (لرسائل SMS)
  recipientEmail?: string | null; // البريد الإلكتروني (للإيميلات)
}

/**
 * دالة تفاعلية لمحاكاة إرسال التنبيهات وحفظ التنبيهات الداخلية داخل التطبيق
 */
export async function sendMockNotification({
  userId,
  title,
  titleAr,
  message,
  messageAr,
  type = "info",
  channels = ["in-app", "sms", "email"],
  recipientPhone,
  recipientEmail,
}: SendMockNotificationParams) {
  try {
    const results: { inAppSaved?: boolean; smsMocked?: boolean; emailMocked?: boolean } = {};

    // 1. التنبيه داخل التطبيق (حفظه في قاعدة البيانات)
    if (channels.includes("in-app")) {
      await prisma.notification.create({
        data: {
          userId: userId || null,
          title,
          titleAr: titleAr || title,
          message,
          messageAr: messageAr || message,
          type,
        },
      });
      results.inAppSaved = true;
    }

    // 2. محاكاة رسائل الجوال القصيرة SMS وطباعتها في الـ Console
    if (channels.includes("sms")) {
      const phone = recipientPhone || "+966500000000";
      console.log("\n========================================================");
      console.log(`📱 [MOCK SMS DISPATCH] To: ${phone}`);
      console.log(`   Message (AR): ${messageAr || message}`);
      console.log(`   Message (EN): ${message}`);
      console.log("========================================================\n");
      results.smsMocked = true;
    }

    // 3. محاكاة البريد الإلكتروني وطباعتها في الـ Console
    if (channels.includes("email")) {
      const email = recipientEmail || "mock.recipient@moeen.org";
      console.log("\n========================================================");
      console.log(`✉️ [MOCK EMAIL DISPATCH] To: ${email}`);
      console.log(`   Subject (AR): ${titleAr || title}`);
      console.log(`   Subject (EN): ${title}`);
      console.log(`   Body (AR): ${messageAr || message}`);
      console.log(`   Body (EN): ${message}`);
      console.log("========================================================\n");
      results.emailMocked = true;
    }

    return { success: true, ...results };
  } catch (error) {
    console.error("Failed to dispatch mock notification:", error);
    return { success: false, error };
  }
}
