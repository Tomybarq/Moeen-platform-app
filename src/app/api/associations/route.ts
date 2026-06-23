import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { associationSchema } from "@/lib/zodSchemas";
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

    const [associations, total] = await Promise.all([
      prisma.association.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.association.count({ where }),
    ]);

    return NextResponse.json({
      associations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/associations error:", error);
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
    const result = associationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const newAssociation = await prisma.association.create({
      data: {
        name: result.data.name,
        image: result.data.image,
      },
    });

    // إرسال تنبيه وهمي عند إضافة جمعية
    await sendMockNotification({
      userId: session.userId,
      title: `New association registered: ${newAssociation.name}`,
      titleAr: `تم تسجيل جمعية جديدة: ${newAssociation.name}`,
      message: `The association "${newAssociation.name}" has been successfully added to the portal.`,
      messageAr: `تمت إضافة الجمعية "${newAssociation.name}" بنجاح في لوحة التحكم.`,
      type: "success",
      channels: ["in-app", "sms", "email"]
    });

    return NextResponse.json({ success: true, association: newAssociation });
  } catch (error) {
    console.error("POST /api/associations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
