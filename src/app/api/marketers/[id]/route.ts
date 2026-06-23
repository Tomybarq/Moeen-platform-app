import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { marketerSchema } from "@/lib/zodSchemas";
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

    // تسجيل الحدث
    logEvent("marketer.updated", updatedMarketer, session.userId);

    // إرسال التنبيه عبر موزع الأحداث في الخلفية
    notificationDispatcher.emit("marketer.updated", {
      marketer: updatedMarketer,
      sessionUserId: session.userId,
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

    const deletedMarketer = await prisma.marketer.delete({
      where: { id: marketerId },
    });

    // تسجيل الحدث
    logEvent("marketer.deleted", { id: marketerId, name: deletedMarketer.name }, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/marketers/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
