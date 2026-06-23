import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.roleType !== "superadmin" && session.roleType !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const { name, email, roleId } = await request.json();

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. If target user is superadmin, only they can edit their own details
    if (targetUser.role.type === "superadmin" && session.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. If target user is admin, another admin cannot edit their details
    if (targetUser.role.type === "admin" && session.roleType === "admin") {
      return NextResponse.json({ error: "لا يمكنك تعديل بيانات هذا المستخدم" }, { status: 403 });
    }

    const updateData: { name?: string | null; email?: string; roleId?: number } = {};

    if (name !== undefined) {
      updateData.name = name && name.trim() !== "" ? name.trim() : null;
    }

    if (email !== undefined) {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
      }
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });
      if (existingEmailUser) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
      }
      updateData.email = email;
    }

    if (roleId !== undefined) {
      const targetRoleId = parseInt(roleId);
      const targetRole = await prisma.role.findUnique({
        where: { id: targetRoleId },
      });

      if (!targetRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      const isSuperAdmin = session.roleType === "superadmin";
      if (!isSuperAdmin && targetRole.type !== "user") {
        return NextResponse.json({ error: "لا يمكنك تعيين أدوار إدارية للمستخدمين" }, { status: 403 });
      }

      if (targetRole.type === "superadmin" || targetRole.type === "admin") {
        const count = await prisma.user.count({
          where: {
            roleId: targetRoleId,
            NOT: { id: userId },
          },
        });
        if (count > 0) {
          return NextResponse.json({
            error: "هذا الدور مخصص لمستخدم واحد فقط كحد أقصى",
          }, { status: 400 });
        }
      }
      updateData.roleId = targetRoleId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
