import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { beneficiarySchema } from "@/lib/zodSchemas";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = beneficiarySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        name: result.data.name,
      },
    });

    return NextResponse.json({ success: true, beneficiary: updatedBeneficiary });
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

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.beneficiary.delete({
      where: { id: beneficiaryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/beneficiaries/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
