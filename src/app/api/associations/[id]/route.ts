import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hasServerPermission } from "@/lib/auth";
import { applyRowLevelSecurity } from "@/lib/auth-rls";
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

    // 1. التحقق من صلاحية التعديل
    const hasPerm = await hasServerPermission(session.userId, "/portal/associations", "edit");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 2. التحقق من قيود أمن مستوى الصف (RLS)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);
    const existingAssociation = await prisma.association.findFirst({
      where: {
        AND: [
          { id: associationId },
          rlsFilters.association
        ]
      }
    });

    if (!existingAssociation) {
      return NextResponse.json({ error: "الجمعية غير موجودة أو غير مصرح لك بالوصول إليها" }, { status: 404 });
    }

    const body = await request.json();
    const result = associationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
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

    // 1. التحقق من صلاحية الحذف
    const hasPerm = await hasServerPermission(session.userId, "/portal/associations", "delete");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const associationId = parseInt(id);
    if (isNaN(associationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 2. التحقق من قيود أمن مستوى الصف (RLS)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);
    const existingAssociation = await prisma.association.findFirst({
      where: {
        AND: [
          { id: associationId },
          rlsFilters.association
        ]
      }
    });

    if (!existingAssociation) {
      return NextResponse.json({ error: "الجمعية غير موجودة أو غير مصرح لك بالوصول إليها" }, { status: 404 });
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
