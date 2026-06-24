import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applyRowLevelSecurity } from "@/lib/auth-rls";

/**
 * دالة معالجة طلبات GET لربط وإرجاع الإحصائيات المؤمّنة والخاصة بالمستندات والجمعيات والمستفيدين
 * بما يطابق الصلاحيات وسياق المستخدم الحالي لتجنب تسريب البيانات (Data Leakage).
 */
export async function GET(request: Request) {
  try {
    // 1. التحقق من صحة الجلسة والمصادقة
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. تطبيق نظام أمان مستوى الصف (Row-Level Security)
    const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);

    // 3. جلب الإحصائيات الفورية بالتوازي لضمان سرعة الاستجابة وأفضل أداء قاعدة بيانات
    const [
      activeBeneficiariesCount,
      supportRequestsCount,
      relatedAssociationsCount
    ] = await Promise.all([
      // إجمالي المستفيدين المستحقين والنشطين
      prisma.beneficiary.count({
        where: {
          AND: [
            rlsFilters.beneficiary,
            { status: "ELIGIBLE" }
          ]
        }
      }),
      // إجمالي طلبات الدعم المالي والاجتماعي القائمة (قيد الدراسة)
      prisma.beneficiary.count({
        where: {
          AND: [
            rlsFilters.beneficiary,
            { status: "PENDING" }
          ]
        }
      }),
      // إجمالي الجمعيات الخيرية المرتبطة بنطاق صلاحيات المستخدم
      prisma.association.count({
        where: rlsFilters.association
      })
    ]);

    // 4. إرجاع النتائج بشكل منسق ومحمي
    return NextResponse.json({
      success: true,
      data: {
        activeBeneficiaries: activeBeneficiariesCount,
        supportRequests: supportRequestsCount,
        relatedAssociations: relatedAssociationsCount
      }
    });
  } catch (error) {
    console.error("GET /api/portal/stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
