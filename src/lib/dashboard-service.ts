import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applyRowLevelSecurity } from "@/lib/auth-rls";

export interface DashboardStats {
  totals: {
    associations: number;
    beneficiaries: number;
    marketers: number;
    users: number;
  };
  recent: {
    beneficiaries: { id: number; name: string; createdAt: Date }[];
    associations: { id: number; name: string; createdAt: Date }[];
    marketers: { id: number; name: string; createdAt: Date }[];
  };
  monthlyGrowth: {
    monthAr: string;
    monthEn: string;
    beneficiaries: number;
    marketers: number;
    associations: number;
  }[];
  recentActivities: any[];
}

/**
 * جلب الإحصائيات الحية مع تطبيق نظام أمان مستوى الصف (Row-Level Security)
 * بناءً على هوية المستخدم المتصل وصلاحيات دوره الهيكلي.
 */
export async function getLiveDashboardStats(): Promise<DashboardStats> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 1. تطبيق نظام أمان مستوى الصف (Row-Level Security) للحصول على مرشحات الاستعلام المناسبة
  const rlsFilters = await applyRowLevelSecurity(session.userId, session.role);

  // 2. جلب المجاميع الإجمالية الحية بالتوازي لضمان سرعة الاستجابة
  const [associationsCount, beneficiariesCount, marketersCount, usersCount] = await Promise.all([
    prisma.association.count({ where: rlsFilters.association }),
    prisma.beneficiary.count({ where: rlsFilters.beneficiary }),
    prisma.marketer.count({ where: rlsFilters.marketer }),
    prisma.user.count({ where: rlsFilters.user }),
  ]);

  // 3. جلب أحدث 5 سجلات مضافة لكل من النماذج المصرح بها
  const [recentBeneficiaries, recentAssociations, recentMarketers] = await Promise.all([
    prisma.beneficiary.findMany({
      where: rlsFilters.beneficiary,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.association.findMany({
      where: rlsFilters.association,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.marketer.findMany({
      where: rlsFilters.marketer,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  // 4. جلب أحدث 5 أحداث في النظام المصرح للمستخدم بالاطلاع عليها (سجل العمليات الآمن)
  const recentActivities = await prisma.systemEvent.findMany({
    where: rlsFilters.systemEvent,
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      eventType: true,
      createdAt: true,
      userId: true,
    },
  });

  // جلب أسماء المستخدمين المسؤولين عن هذه الأحداث لربطها
  const userIds = recentActivities
    .map((a) => a.userId)
    .filter((id): id is number => id !== null);

  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = new Map(users.map((u) => [u.id, u]));

  const activitiesWithUsers = recentActivities.map((activity) => {
    const user = activity.userId ? userMap.get(activity.userId) : null;
    return {
      id: activity.id,
      eventType: activity.eventType,
      createdAt: activity.createdAt,
      user: user ? { name: user.name, email: user.email } : null,
    };
  });

  // 5. احتساب النمو التراكمي لآخر 6 أشهر بناءً على معايير الـ RLS
  const now = new Date();
  const monthlyGrowth = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const [bCount, mCount, aCount] = await Promise.all([
      prisma.beneficiary.count({
        where: {
          AND: [
            rlsFilters.beneficiary,
            { createdAt: { lte: endDate } },
          ],
        },
      }),
      prisma.marketer.count({
        where: {
          AND: [
            rlsFilters.marketer,
            { createdAt: { lte: endDate } },
          ],
        },
      }),
      prisma.association.count({
        where: {
          AND: [
            rlsFilters.association,
            { createdAt: { lte: endDate } },
          ],
        },
      }),
    ]);

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

  return {
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
    recentActivities: activitiesWithUsers,
  };
}
