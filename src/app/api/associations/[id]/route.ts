import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { associationSchema } from "@/lib/zodSchemas";
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
    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = associationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const updatedAssociation = await prisma.association.update({
      where: { id: associationId },
      data: {
        name: result.data.name,
        image: result.data.image,
      },
    });

    // تسجيل الحدث
    logEvent("association.updated", updatedAssociation, session.userId);

    // إرسال التنبيه عبر موزع الأحداث في الخلفية
    notificationDispatcher.emit("association.updated", {
      association: updatedAssociation,
      sessionUserId: session.userId,
    });

    return NextResponse.json({ success: true, association: updatedAssociation });
  } catch (error) {
    console.error("PUT /api/associations/[id] error:", error);
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
    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const deletedAssociation = await prisma.association.delete({
      where: { id: associationId },
    });

    // تسجيل الحدث
    logEvent("association.deleted", { id: associationId, name: deletedAssociation.name }, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/associations/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
