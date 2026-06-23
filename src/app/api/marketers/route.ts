import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { marketerSchema } from "@/lib/zodSchemas";

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

    const [marketers, total] = await Promise.all([
      prisma.marketer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.marketer.count({ where }),
    ]);

    return NextResponse.json({
      marketers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/marketers error:", error);
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
    const result = marketerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const newMarketer = await prisma.marketer.create({
      data: {
        name: result.data.name,
      },
    });

    return NextResponse.json({ success: true, marketer: newMarketer });
  } catch (error) {
    console.error("POST /api/marketers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
