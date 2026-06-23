import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { marketerSchema } from "@/lib/zodSchemas";

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
    const marketerId = parseInt(id);
    if (isNaN(marketerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = marketerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const updatedMarketer = await prisma.marketer.update({
      where: { id: marketerId },
      data: {
        name: result.data.name,
        image: result.data.image,
      },
    });

    return NextResponse.json({ success: true, marketer: updatedMarketer });
  } catch (error) {
    console.error("PUT /api/marketers/[id] error:", error);
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
    const marketerId = parseInt(id);
    if (isNaN(marketerId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.marketer.delete({
      where: { id: marketerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/marketers/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
