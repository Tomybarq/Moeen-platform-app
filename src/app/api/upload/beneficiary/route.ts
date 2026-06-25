import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

/**
 * نقطة وصول مرفوعة لرفع صور البحث الاجتماعي والوثائق الثبوتية بشكل محمي.
 * تدعم التحقق من الحجم والنوع لمنع رفع ملفات ضارة، وتستخدم معرفات UUID لتلافي ثغرات المسار.
 */
export async function POST(request: Request) {
  try {
    // 1. التحقق من المصادقة وصحة الجلسة
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    // 2. استقبال بيانات النموذج الثنائي
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف للرفع" }, { status: 400 });
    }

    // 3. التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)" },
        { status: 400 }
      );
    }

    // 4. التحقق من صيغة ونوع الملف المرفوع
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "صيغة الملف غير مدعومة (يسمح فقط بصيغ JPG, PNG, WEBP, PDF)" },
        { status: 400 }
      );
    }

    // 5. تمويه وتوليد اسم آمن للملف لمنع هجمات الالتفاف Path Traversal
    const originalExt = path.extname(file.name).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".pdf"].includes(originalExt)
      ? originalExt
      : file.type === "application/pdf" ? ".pdf" : ".webp";

    const uniqueFilename = `${randomUUID()}${safeExt}`;

    // 6. مسارات التخزين
    const relativePath = `/uploads/beneficiaries/${uniqueFilename}`;
    const absoluteDir = path.join(process.cwd(), "public", "uploads", "beneficiaries");
    const absolutePath = path.join(absoluteDir, uniqueFilename);

    // التحقق لمنع هجمات الالتفاف
    const resolvedPath = path.resolve(absolutePath);
    if (!resolvedPath.startsWith(absoluteDir)) {
      return NextResponse.json({ error: "محاولة اختراق مسار غير مصرح بها" }, { status: 400 });
    }

    // 7. إنشاء المجلد تلقائياً
    await mkdir(absoluteDir, { recursive: true });

    // 8. حفظ الملف على القرص
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(absolutePath, buffer);

    return NextResponse.json({
      success: true,
      filePath: relativePath,
    });
  } catch (error) {
    console.error("POST /api/upload/beneficiary error:", error);
    return NextResponse.json(
      { error: "فشل رفع الملف في النظام الداخلي" },
      { status: 500 }
    );
  }
}
