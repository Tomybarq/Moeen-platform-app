import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hasServerPermission } from "@/lib/auth";
import { applyRowLevelSecurity } from "@/lib/auth-rls";
import { associationSchema } from "@/lib/zodSchemas";
import { logEvent } from "@/lib/eventLogger";
import { notificationDispatcher } from "@/lib/notificationEngine";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // التحقق من صلاحية القراءة للمستخدم
    const hasPerm = await hasServerPermission(session.userId, "/portal/associations", "view");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // تطبيق أمن مستوى الصف (RLS)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);

    const where: any = {
      AND: [rlsFilters.association]
    };
    if (search.trim() !== "") {
      where.AND.push({
        name: {
          contains: search,
          mode: "insensitive",
        }
      });
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

    // التحقق من صلاحية الإضافة للمستند/الجمعية
    const hasPerm = await hasServerPermission(session.userId, "/portal/associations", "create");
    if (!hasPerm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = associationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const newAssociation = await prisma.association.create({
      data: {
        name: result.data.name,
        image: result.data.image,
      },
    });

    // تسجيل الحدث
    logEvent("association.created", newAssociation, session.userId);

    // إرسال التنبيه عبر موزع الأحداث في الخلفية
    notificationDispatcher.emit("association.created", {
      association: newAssociation,
      sessionUserId: session.userId,
    });

    return NextResponse.json({ success: true, association: newAssociation });
  } catch (error) {
    console.error("POST /api/associations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
