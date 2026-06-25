import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hasServerPermission } from "@/lib/auth";
import { applyRowLevelSecurity } from "@/lib/auth-rls";
import { beneficiarySchema } from "@/lib/zodSchemas";
import { maskSensitiveData } from "@/lib/dataMasking";
import { logEvent } from "@/lib/eventLogger";
import { notificationDispatcher } from "@/lib/notificationEngine";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. التحقق من صلاحية تعديل بيانات مستفيد
    const hasPerm = await hasServerPermission(session.userId, "/portal/beneficiaries", "edit");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 2. التحقق من قيود أمن مستوى الصف (RLS)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        AND: [
          { id: beneficiaryId },
          rlsFilters.beneficiary
        ]
      }
    });

    if (!existingBeneficiary) {
      return NextResponse.json({ error: "المستفيد غير موجود أو غير مصرح لك بالوصول إليه" }, { status: 404 });
    }

    const body = await request.json();
    const result = beneficiarySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        name: result.data.name,
        image: result.data.image,
        nationalId: result.data.nationalId,
        phone: result.data.phone,
      },
    });

    // تسجيل الحدث
    logEvent("beneficiary.updated", updatedBeneficiary, session.userId);

    // إرسال التنبيه عبر موزع الأحداث في الخلفية
    notificationDispatcher.emit("beneficiary.updated", {
      beneficiary: updatedBeneficiary,
      sessionUserId: session.userId,
    });

    const maskedBeneficiary = maskSensitiveData(updatedBeneficiary, session.role);

    return NextResponse.json({ success: true, beneficiary: maskedBeneficiary });
  } catch (error) {
    console.error("PUT /api/beneficiaries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. التحقق من صلاحية حذف مستفيد
    const hasPerm = await hasServerPermission(session.userId, "/portal/beneficiaries", "delete");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 2. التحقق من قيود أمن مستوى الصف (RLS)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        AND: [
          { id: beneficiaryId },
          rlsFilters.beneficiary
        ]
      }
    });

    if (!existingBeneficiary) {
      return NextResponse.json({ error: "المستفيد غير موجود أو غير مصرح لك بالوصول إليه" }, { status: 404 });
    }

    const deletedBeneficiary = await prisma.beneficiary.delete({
      where: { id: beneficiaryId },
    });

    // تسجيل الحدث
    logEvent("beneficiary.deleted", { id: beneficiaryId, name: deletedBeneficiary.name }, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/beneficiaries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
