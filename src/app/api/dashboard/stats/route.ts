import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get totals
    const [associationsCount, beneficiariesCount, marketersCount, usersCount] = await Promise.all([
      prisma.association.count(),
      prisma.beneficiary.count(),
      prisma.marketer.count(),
      prisma.user.count(),
    ]);

    // 2. Fetch recent activity (last 5 of each)
    const [recentBeneficiaries, recentAssociations, recentMarketers] = await Promise.all([
      prisma.beneficiary.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.association.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.marketer.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    // 3. Generate 6-month growth data
    // We will calculate start and end dates for the last 6 months
    const now = new Date();
    const monthlyGrowth = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Fetch counts created up to endDate (cumulative)
      const [bCount, mCount, aCount] = await Promise.all([
        prisma.beneficiary.count({
          where: { createdAt: { lte: endDate } },
        }),
        prisma.marketer.count({
          where: { createdAt: { lte: endDate } },
        }),
        prisma.association.count({
          where: { createdAt: { lte: endDate } },
        }),
      ]);

      // Month name
      const monthNameAr = d.toLocaleDateString("ar-SA", { month: "short" });
      const monthNameEn = d.toLocaleDateString("en-US", { month: "short" });

      monthlyGrowth.push({
        monthAr: monthNameAr,
        monthEn: monthNameEn,
        beneficiaries: bCount,
        marketers: mCount,
        associations: aCount,
      });
    }

    return NextResponse.json({
      totals: {
        associations: associationsCount,
        beneficiaries: beneficiariesCount,
        marketers: marketersCount,
        users: usersCount,
      },
      recent: {
        beneficiaries: recentBeneficiaries,
        associations: recentAssociations,
        marketers: recentMarketers,
      },
      monthlyGrowth,
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
