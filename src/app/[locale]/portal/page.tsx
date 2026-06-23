import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const session = await getSession();

  // Fetch counts from database
  const [associationsCount, beneficiariesCount, marketersCount, usersCount] = await Promise.all([
    prisma.association.count(),
    prisma.beneficiary.count(),
    prisma.marketer.count(),
    prisma.user.count(),
  ]);

  const userName = session?.name || "User";

  return (
    <div className="space-y-8">
      {/* Greeting card */}
      <div className="bg-gradient-to-r from-primary to-tertiary rounded-2xl p-8 text-white shadow-xl shadow-primary/10">
        <h1 className="text-2xl font-bold mb-2">
          {t("welcome", { name: userName })}
        </h1>
        <p className="text-teal-50/90 text-sm">
          {t("title")}
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("associationsCount"), count: associationsCount, bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" },
          { label: t("beneficiariesCount"), count: beneficiariesCount, bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" },
          { label: t("marketersCount"), count: marketersCount, bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" },
          { label: t("usersCount"), count: usersCount, bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.count}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${stat.bg}`}>
              #
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
