import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logEvent } from "@/lib/eventLogger";
import { maskSensitiveData } from "@/lib/dataMasking";

export async function GET(request: Request) {
  try {
    // 1. التحقق من الجلسة والصلاحية
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. قراءة المعايير والتحقق من نوع التصدير
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type !== "beneficiaries") {
      return NextResponse.json({ error: "Unsupported export type" }, { status: 400 });
    }

    // تسجيل حدث تصدير البيانات لتتبع العمليات الحساسة (Audit Log)
    logEvent("beneficiary.export", { type, userId: session.userId }, session.userId);

    // 3. بناء تيار البيانات المتدفق (ReadableStream)
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // كتابة UTF-8 BOM لضمان توافق اللغة العربية والترميز في Microsoft Excel
        controller.enqueue(encoder.encode("\uFEFF"));

        // كتابة أسماء الأعمدة (CSV Header)
        const csvHeader = "المعرف,الاسم,الحالة,الهوية الوطنية,رقم الجوال,تاريخ التسجيل\n";
        controller.enqueue(encoder.encode(csvHeader));

        let cursor: { id: number } | undefined = undefined;
        const batchSize = 100;
        let hasMore = true;

        while (hasMore) {
          // جلب البيانات على دفعات باستخدام Cursor-based pagination
          const batch = await prisma.beneficiary.findMany({
            take: batchSize,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor.id } : undefined,
            orderBy: { id: "asc" },
          });

          if (batch.length === 0) {
            hasMore = false;
            break;
          }

          // تحويل الدفعة الحالية إلى أسطر CSV
          let csvChunk = "";
          for (const item of batch) {
            const maskedItem: any = maskSensitiveData(item, session.role);
            const escapeCSV = (val: string | null | undefined) => {
              if (val === null || val === undefined) return '""';
              const clean = val.replace(/"/g, '""');
              if (clean.includes(",") || clean.includes("\n") || clean.includes("\r") || clean.includes('"')) {
                return `"${clean}"`;
              }
              return clean;
            };

            const id = maskedItem.id.toString();
            const name = escapeCSV(maskedItem.name);
            const status = escapeCSV(maskedItem.status);
            const nationalId = escapeCSV(maskedItem.nationalId);
            const phone = escapeCSV(maskedItem.phone);
            const createdAt = escapeCSV(maskedItem.createdAt instanceof Date ? maskedItem.createdAt.toISOString() : maskedItem.createdAt);

            csvChunk += `${id},${name},${status},${nationalId},${phone},${createdAt}\n`;
          }

          // دفع البيانات للمستعرض فورا
          controller.enqueue(encoder.encode(csvChunk));

          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            cursor = { id: batch[batch.length - 1].id };
          }
        }

        controller.close();
      },
    });

    // إرجاع الاستجابة بمسار تحميل الملف
    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="beneficiaries_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
