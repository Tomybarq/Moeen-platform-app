import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { socialResearchSchema } from "@/lib/zodSchemas";
import { logEvent } from "@/lib/eventLogger";

/**
 * تحديث بيانات البحث الاجتماعي والميداني لمستفيد محدد.
 * يسمح فقط للباحث الاجتماعي (SOCIAL_RESEARCHER) ومسؤول النظام (SUPER_ADMIN) بالوصول وتحديث هذه الحقول الحساسة.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. التحقق من جلسة المستخدم ومصادقته
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    // 2. التحقق من صلاحيات الدور (يسمح فقط للباحث الاجتماعي ومدير النظام)
    const isAuthorized =
      session.role === "SUPER_ADMIN" || session.role === "SOCIAL_RESEARCHER";
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "عذراً، لا تمتلك الصلاحيات الكافية لتعديل بيانات البحث الاجتماعي" },
        { status: 403 }
      );
    }

    // 3. التحقق من معرف المستفيد وصلاحيته
    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "معرف المستفيد غير صحيح" }, { status: 400 });
    }

    // 4. قراءة وتحليل بيانات الطلب باستخدام Zod
    const body = await request.json();
    const result = socialResearchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // التحقق من وجود المستفيد مسبقاً في قاعدة البيانات
    const existingBeneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    });

    if (!existingBeneficiary) {
      return NextResponse.json({ error: "المستفيد غير موجود بالنظام" }, { status: 404 });
    }

    // 5. حفظ البيانات المحدثة في جدول المستفيدين مع ربط معرف الباحث الحالي
    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        maritalStatus: result.data.maritalStatus,
        familyMembersCount: result.data.familyMembersCount,
        nationalAddress: result.data.nationalAddress,
        educationLevel: result.data.educationLevel,
        healthStatus: result.data.healthStatus,
        healthDetails: result.data.healthDetails,

        // الإطار المالي - الدخل
        jobIncome: result.data.jobIncome,
        disabilityIncome: result.data.disabilityIncome,
        citizenAccount: result.data.citizenAccount,
        socialInsurance: result.data.socialInsurance,
        otherIncome: result.data.otherIncome,
        otherIncomeSource: result.data.otherIncomeSource,

        // الإطار المالي - الالتزامات
        houseRent: result.data.houseRent,
        electricityBill: result.data.electricityBill,
        waterBill: result.data.waterBill,
        internetBill: result.data.internetBill,
        medicalExpenses: result.data.medicalExpenses,
        transportExpenses: result.data.transportExpenses,
        foodExpenses: result.data.foodExpenses,
        debtsMonthly: result.data.debtsMonthly,
        debtReason: result.data.debtReason,

        // شواهد البحث الميداني
        buildingImage: result.data.buildingImage,
        livingRoomImage: result.data.livingRoomImage,
        kitchenImage: result.data.kitchenImage,
        rentContractFile: result.data.rentContractFile,

        // توصية الباحث وحالته
        finalRecommendation: result.data.finalRecommendation,
        statusCategory: result.data.statusCategory,
        researcherId: session.userId, // تسجيل الباحث المسؤول عن الحالة
      },
    });

    // 6. تسجيل الحدث في نظام المتابعة والأحداث التدقيقية
    logEvent("beneficiary.research.updated", updatedBeneficiary, session.userId);

    return NextResponse.json({
      success: true,
      beneficiary: updatedBeneficiary,
    });
  } catch (error) {
    console.error("PUT /api/beneficiaries/[id]/research error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء تحديث بيانات البحث الاجتماعي" },
      { status: 500 }
    );
  }
}
