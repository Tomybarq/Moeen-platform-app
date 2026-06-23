import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { beneficiarySchema } from "@/lib/zodSchemas";
import { calculateLocalEligibility } from "@/lib/engine/eligibility";
import { sendMockNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search.trim() !== "") {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [beneficiaries, total] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.beneficiary.count({ where }),
    ]);

    return NextResponse.json({
      beneficiaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/beneficiaries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = beneficiarySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    // استخراج معايير الاستحقاق اختيارياً من الطلب
    const { familySize, monthlyIncome, medicalStatus, rent } = body;

    let status = "PENDING";
    let notes = "لم يتم إجراء تحليل الاستحقاق التلقائي.";

    if (
      typeof familySize === "number" &&
      typeof monthlyIncome === "number" &&
      typeof medicalStatus === "string" &&
      typeof rent === "number"
    ) {
      const eligibility = calculateLocalEligibility({
        familySize,
        monthlyIncome,
        medicalStatus,
        rent,
      });
      status = eligibility.status;
      notes = eligibility.notes;
    }

    const newBeneficiary = await prisma.beneficiary.create({
      data: {
        name: result.data.name,
        status,
        notes,
        image: result.data.image,
      },
    });

    // إرسال تنبيه وهمي عند إضافة مستفيد مع توضيح حالة الاستحقاق
    await sendMockNotification({
      userId: session.userId,
      title: `New beneficiary registered: ${newBeneficiary.name} (Status: ${newBeneficiary.status})`,
      titleAr: `تم تسجيل مستفيد جديد: ${newBeneficiary.name} (الحالة: ${newBeneficiary.status === "ELIGIBLE" ? "مستحق" : newBeneficiary.status === "PENDING" ? "قيد الدراسة" : "غير مستحق"})`,
      message: `Beneficiary "${newBeneficiary.name}" has been registered. System eligibility check notes: ${newBeneficiary.notes}`,
      messageAr: `تم تسجيل المستفيد "${newBeneficiary.name}" في النظام بنجاح. نتيجة فحص الاستحقاق التلقائي: ${newBeneficiary.notes}`,
      type: newBeneficiary.status === "ELIGIBLE" ? "success" : newBeneficiary.status === "PENDING" ? "info" : "warning",
      channels: ["in-app", "sms", "email"]
    });

    return NextResponse.json({ success: true, beneficiary: newBeneficiary });
  } catch (error) {
    console.error("POST /api/beneficiaries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
