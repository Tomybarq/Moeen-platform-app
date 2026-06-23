import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * مكتبة لحفظ الملفات المرفوعة والتحقق من سلامتها وأحجامها وصيغها
 * @param file الملف المرفوع
 * @param subFolder المجلد الفرعي للتخزين (avatars | associations | beneficiaries | marketers)
 */
export async function saveUploadedFile(
  file: File,
  subFolder: "avatars" | "associations" | "beneficiaries" | "marketers"
): Promise<UploadResult> {
  try {
    // 1. التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "FILE_TOO_LARGE" };
    }

    // 2. التحقق من صيغة الملف
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: "INVALID_FILE_TYPE" };
    }

    // 3. توليد اسم فريد وآمن للملف لمنع تكرار الأسماء أو هجمات Path Traversal
    const ext = path.extname(file.name) || ".webp";
    const uniqueFilename = `${randomUUID()}${ext}`;

    // 4. تحديد المسار المطلق والنسبي للحفظ
    const relativePath = `/uploads/${subFolder}/${uniqueFilename}`;
    const absoluteDir = path.join(process.cwd(), "public", "uploads", subFolder);
    const absolutePath = path.join(absoluteDir, uniqueFilename);

    // 5. إنشاء المجلد تلقائياً إذا لم يكن موجوداً
    await mkdir(absoluteDir, { recursive: true });

    // 6. قراءة الملف وكتابته على القرص
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(absolutePath, buffer);

    return {
      success: true,
      filePath: relativePath,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return {
      success: false,
      error: "UPLOAD_FAILED",
    };
  }
}
