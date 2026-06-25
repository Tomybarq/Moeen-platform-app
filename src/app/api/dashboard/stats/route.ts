import { NextResponse } from "next/server";
import { getLiveDashboardStats } from "@/lib/dashboard-service";

export const dynamic = "force-dynamic"; // منع الكاش لضمان جلب البيانات الحية دوماً

export async function GET() {
  try {
    const stats = await getLiveDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("GET /api/dashboard/stats error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
