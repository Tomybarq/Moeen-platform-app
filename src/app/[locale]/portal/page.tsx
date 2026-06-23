"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import StatsCard from "@/components/portal/dashboard/StatsCard";
import GrowthChart from "@/components/portal/dashboard/GrowthChart";
import DistributionChart from "@/components/portal/dashboard/DistributionChart";
import RecentActivity from "@/components/portal/dashboard/RecentActivity";
import KPISection from "@/components/portal/dashboard/KPISection";
import { useParams } from "next/navigation";

interface DashboardStats {
  totals: {
    associations: number;
    beneficiaries: number;
    marketers: number;
    users: number;
  };
  recent: {
    beneficiaries: any[];
    associations: any[];
    marketers: any[];
  };
  monthlyGrowth: any[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const { showToast } = useToast();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      } else {
        showToast(data.error || (isAr ? "فشل جلب إحصائيات لوحة التحكم" : "Failed to fetch dashboard stats"), "error");
      }
    } catch (err) {
      showToast(isAr ? "خطأ في الاتصال بالخادم" : "Server connection error", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAr, showToast]);

  useEffect(() => {
    fetchStats();

    // Auto refresh every 2 minutes
    const interval = setInterval(() => {
      fetchStats(true);
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const userName = user?.name || (isAr ? "المستخدم" : "User");

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" />
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Get historical growth arrays for sparklines
  const getGrowthHistory = (key: "beneficiaries" | "marketers" | "associations") => {
    if (!stats || !stats.monthlyGrowth) return [];
    return stats.monthlyGrowth.map((g) => g[key]);
  };

  return (
    <div className="space-y-8">
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
          value={stats?.totals.associations || 0}
          history={getGrowthHistory("associations")}
          color="blue"
          iconText="🏠"
          isAr={isAr}
        />
        <StatsCard
          label={t("beneficiariesCount")}
          value={stats?.totals.beneficiaries || 0}
          history={getGrowthHistory("beneficiaries")}
          color="emerald"
          iconText="👥"
          isAr={isAr}
        />
        <StatsCard
          label={t("marketersCount")}
          value={stats?.totals.marketers || 0}
          history={getGrowthHistory("marketers")}
          color="amber"
          iconText="📢"
          isAr={isAr}
        />
        <StatsCard
          label={t("usersCount")}
          value={stats?.totals.users || 0}
          history={[1, 1, 1, 1, 1, stats?.totals.users || 1]} // simple mock user growth
          color="purple"
          iconText="🔑"
          isAr={isAr}
        />
      </div>

      {/* KPI Section */}
      <KPISection
        associations={stats?.totals.associations || 0}
        beneficiaries={stats?.totals.beneficiaries || 0}
        marketers={stats?.totals.marketers || 0}
        isAr={isAr}
      />

      {/* Charts & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2">
          <GrowthChart data={stats?.monthlyGrowth || []} isAr={isAr} />
        </div>

        {/* Distribution Chart */}
        <div>
          <DistributionChart
            associations={stats?.totals.associations || 0}
            beneficiaries={stats?.totals.beneficiaries || 0}
            marketers={stats?.totals.marketers || 0}
            isAr={isAr}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <RecentActivity
          beneficiaries={stats?.recent.beneficiaries || []}
          associations={stats?.recent.associations || []}
          marketers={stats?.recent.marketers || []}
          isAr={isAr}
        />
      </div>
    </div>
  );
}
