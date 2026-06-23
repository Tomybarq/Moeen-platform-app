import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    // 1. التحقق من الجلسة والصلاحية
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. قراءة بيانات الـ Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // التحقق من نوع الكيان لتوجيه الحفظ للمجلد المناسب
    const validTypes = ["avatars", "associations", "beneficiaries", "marketers"] as const;
    const subFolder = type as typeof validTypes[number];

    if (!type || !validTypes.includes(subFolder)) {
      return NextResponse.json(
        { error: "Invalid upload type. Must be one of: avatars, associations, beneficiaries, marketers" },
        { status: 400 }
      );
    }

    // 3. حفظ الملف عبر مكتبة الرفع المساعدة
    const uploadResult = await saveUploadedFile(file, subFolder);

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      filePath: uploadResult.filePath,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
