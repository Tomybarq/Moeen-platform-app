import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // جلب آخر 20 تنبيه للمستخدم الحالي أو التنبيهات العامة بالنظام
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { userId: null },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // تعيين كافة تنبيهات المستخدم الحالي أو التنبيهات العامة كمقروءة دفعة واحدة
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: session.userId },
          { userId: null },
        ],
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
