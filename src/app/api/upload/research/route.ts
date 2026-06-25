import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import path from "path";
import fs from "fs";
import sharp from "sharp";

/**
 * API لرفع ملفات وصور البحث الاجتماعي مع معالجة وضغط الصور تلقائياً باستخدام Sharp.
 */
export async function POST(request: Request) {
  try {
    // 1. التحقق من المصادقة والصلاحيات للباحثين والإداريين
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "SUPER_ADMIN" ||
      session.role === "SOCIAL_RESEARCHER" ||
      session.role === "CHARITY_STAFF";
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "عذراً، لا تمتلك الصلاحية الكافية لرفع ملفات البحث" },
        { status: 403 }
      );
    }

    // 2. قراءة بيانات الملف من الـ Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرسال أي ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. التحقق من حجم الملف (الأقصى 5 ميجابايت)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً، الحد الأقصى 5 ميجابايت" },
        { status: 400 }
      );
    }

    // 4. تحديد اسم الملف والمجلد عشوائياً وحمايته لمنع تداخل الأسماء
    const fileUuid = crypto.randomUUID();
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    
    // إنشاء مسار المجلد المخصص للبحث الاجتماعي
    const uploadDir = path.join(process.cwd(), "public", "uploads", "research");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let relativePath = "";
    
    if (isPdf) {
      // حفظ ملفات الـ PDF مباشرة دون معالجة رسومية
      const filename = `${fileUuid}.pdf`;
      relativePath = `/uploads/research/${filename}`;
      const absolutePath = path.join(uploadDir, filename);
      fs.writeFileSync(absolutePath, buffer);
    } else {
      // معالجة وضغط الصور باستخدام Sharp
      const filename = `${fileUuid}.webp`;
      relativePath = `/uploads/research/${filename}`;
      const absolutePath = path.join(uploadDir, filename);

      await sharp(buffer)
        .resize({
          width: 1200,
          withoutEnlargement: true, // الحفاظ على أبعاد الصور الصغيرة دون تكبير
        })
        .toFormat("webp", { quality: 75 })
        .toFile(absolutePath);
    }

    return NextResponse.json({
      success: true,
      message: "تم رفع ومعالجة الملف بنجاح",
      filePath: relativePath,
    });
  } catch (error: any) {
    console.error("API Upload Research Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء رفع ومعالجة الملف" },
      { status: 500 }
    );
  }
}
