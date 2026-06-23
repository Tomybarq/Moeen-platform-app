import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { beneficiarySchema } from "@/lib/zodSchemas";
import { calculateLocalEligibility } from "@/lib/engine/eligibility";
import { maskSensitiveData } from "@/lib/dataMasking";
import { logEvent } from "@/lib/eventLogger";
import { notificationDispatcher } from "@/lib/notificationEngine";

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

    const maskedBeneficiaries = maskSensitiveData(beneficiaries, session.role);

    return NextResponse.json({
      beneficiaries: maskedBeneficiaries,
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
        nationalId: result.data.nationalId,
        phone: result.data.phone,
      },
    });

    // تسجيل الحدث
    logEvent("beneficiary.created", newBeneficiary, session.userId);

    // إرسال التنبيه عبر موزع الأحداث في الخلفية
    notificationDispatcher.emit("beneficiary.created", {
      beneficiary: newBeneficiary,
      sessionUserId: session.userId,
    });

    const maskedBeneficiary = maskSensitiveData(newBeneficiary, session.role);

    return NextResponse.json({ success: true, beneficiary: maskedBeneficiary });
  } catch (error) {
    console.error("POST /api/beneficiaries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
