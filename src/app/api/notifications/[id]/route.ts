import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // تحديث التنبيه المحدد ليكون مقروءاً
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true, notification: updatedNotification });
  } catch (error) {
    console.error("PUT /api/notifications/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
