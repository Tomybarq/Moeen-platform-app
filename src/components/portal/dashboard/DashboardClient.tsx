"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/ToastContext";
import StatsCard from "./StatsCard";
import GrowthChart from "./GrowthChart";
import DistributionChart from "./DistributionChart";
import RecentActivity from "./RecentActivity";
import KPISection from "./KPISection";
import { DashboardStats } from "@/lib/dashboard-service";
import { Clock, Shield, User, Database } from "lucide-react";

interface DashboardClientProps {
  initialStats: DashboardStats;
  userName: string;
  locale: string;
}

export default function DashboardClient({
  initialStats,
  userName,
  locale,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const { showToast } = useToast();
  const isAr = locale === "ar";

  const [stats, setStats] = useState<DashboardStats>(initialStats);

  // تحديث البيانات الحية بشكل صامت في الخلفية
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("خطأ في تحديث إحصائيات لوحة التحكم:", err);
    }
  }, []);

  useEffect(() => {
    // تحديث دوري كل دقيقتين (120000 مللي ثانية)
    const interval = setInterval(() => {
      fetchStats();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  // استخراج سجل النمو التاريخي Sparklines لبطاقات الإحصاءات
  const getGrowthHistory = (key: "beneficiaries" | "marketers" | "associations") => {
    if (!stats.monthlyGrowth) return [];
    return stats.monthlyGrowth.map((g) => g[key]);
  };

  // ترجمة أنواع أحداث النظام إلى العربية والإنجليزية
  const getEventFriendlyName = (eventType: string) => {
    const translations: Record<string, { ar: string; en: string }> = {
      "beneficiary.created": { ar: "تم إضافة مستفيد جديد", en: "New beneficiary added" },
      "beneficiary.updated": { ar: "تم تحديث بيانات مستفيد", en: "Beneficiary data updated" },
      "beneficiary.deleted": { ar: "تم حذف مستفيد من النظام", en: "Beneficiary deleted" },
      "beneficiary.export": { ar: "تم تصدير ملف المستفيدين (CSV)", en: "Beneficiary list exported (CSV)" },
      "beneficiary.research.updated": { ar: "تم اعتماد أو تحديث البحث الاجتماعي للمستفيد", en: "Social research updated/approved" },
      "association.created": { ar: "تم إضافة جمعية جديدة", en: "New charity association added" },
      "association.updated": { ar: "تم تحديث بيانات جمعية", en: "Charity association updated" },
      "association.deleted": { ar: "تم حذف جمعية من النظام", en: "Charity association deleted" },
      "marketer.created": { ar: "تم إضافة مسوق جديد", en: "New marketer added" },
      "marketer.updated": { ar: "تم تحديث بيانات مسوق", en: "Marketer data updated" },
      "marketer.deleted": { ar: "تم حذف مسوق من النظام", en: "Marketer deleted" },
    };
    const item = translations[eventType];
    if (!item) return eventType;
    return isAr ? item.ar : item.en;
  };

  // دالة لحساب التوقيت النسبي للأحداث
  const getRelativeTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (isAr) {
      if (diffMin < 1) return "الآن";
      if (diffMin === 1) return "منذ دقيقة";
      if (diffMin === 2) return "منذ دقيقتين";
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      if (diffHrs === 1) return "منذ ساعة";
      if (diffHrs === 2) return "منذ ساعتين";
      if (diffHrs < 24) return `منذ ${diffHrs} ساعة`;
      if (diffDays === 1) return "أمس";
      if (diffDays === 2) return "منذ يومين";
      return `منذ ${diffDays} أيام`;
    } else {
      if (diffMin < 1) return "Just now";
      if (diffMin === 1) return "1 minute ago";
      if (diffMin < 60) return `${diffMin} minutes ago`;
      if (diffHrs === 1) return "1 hour ago";
      if (diffHrs < 24) return `${diffHrs} hours ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    }
  };

  // تحديد اللون المناسب بناء على نوع الحدث
  const getEventBadgeColor = (eventType: string) => {
    if (eventType.startsWith("beneficiary")) {
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
    }
    if (eventType.startsWith("association")) {
      return "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
    }
    if (eventType.startsWith("marketer")) {
      return "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
    }
    return "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";
  };

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Greeting card */}
      <div className="bg-gradient-to-r from-primary to-tertiary rounded-2xl p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">
            {t("welcome", { name: userName })}
          </h1>
          <p className="text-teal-50/90 text-sm">
            {t("title")}
          </p>
        </div>
        <div className="absolute top-1/2 -end-10 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label={t("associationsCount")}
          value={stats.totals.associations}
          history={getGrowthHistory("associations")}
          color="blue"
          iconText="🏠"
          isAr={isAr}
        />
        <StatsCard
          label={t("beneficiariesCount")}
          value={stats.totals.beneficiaries}
          history={getGrowthHistory("beneficiaries")}
          color="emerald"
          iconText="👥"
          isAr={isAr}
        />
        <StatsCard
          label={t("marketersCount")}
          value={stats.totals.marketers}
          history={getGrowthHistory("marketers")}
          color="amber"
          iconText="📢"
          isAr={isAr}
        />
        <StatsCard
          label={t("usersCount")}
          value={stats.totals.users}
          history={[1, 1, 1, 1, 1, stats.totals.users || 1]}
          color="purple"
          iconText="🔑"
          isAr={isAr}
        />
      </div>

      {/* KPI Section */}
      <KPISection
        associations={stats.totals.associations}
        beneficiaries={stats.totals.beneficiaries}
        marketers={stats.totals.marketers}
        isAr={isAr}
      />

      {/* Charts & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2">
          <GrowthChart data={stats.monthlyGrowth || []} isAr={isAr} />
        </div>

        {/* Distribution Chart */}
        <div>
          <DistributionChart
            associations={stats.totals.associations}
            beneficiaries={stats.totals.beneficiaries}
            marketers={stats.totals.marketers}
            isAr={isAr}
          />
        </div>
      </div>

      {/* Recent Activity & System Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entity Additions */}
        <RecentActivity
          beneficiaries={stats.recent.beneficiaries.map((b) => ({
            ...b,
            createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
          }))}
          associations={stats.recent.associations.map((a) => ({
            ...a,
            createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
          }))}
          marketers={stats.recent.marketers.map((m) => ({
            ...m,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          }))}
          isAr={isAr}
        />

        {/* Live System Logs (RLS Protected Audit Trail) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span>{isAr ? "سجل العمليات الآمن (Live Logs)" : "Secure System Logs (Live)"}</span>
          </h3>

          {!stats.recentActivities || stats.recentActivities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-10 text-xs text-slate-400">
              {isAr ? "لا توجد عمليات مسجلة في نطاق صلاحياتك حالياً." : "No operations logged under your scope."}
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivities.map((activity, idx) => {
                const badgeClass = getEventBadgeColor(activity.eventType);
                return (
                  <div key={activity.id || idx} className="flex items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 last:border-b-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${badgeClass}`}>
                        {activity.eventType.startsWith("beneficiary") ? (
                          <User size={14} />
                        ) : (
                          <Shield size={14} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {getEventFriendlyName(activity.eventType)}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 block">
                          {isAr ? "بواسطة: " : "By: "}
                          {activity.user?.name || activity.user?.email || (isAr ? "نظام آلي" : "System")}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                        {getRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
