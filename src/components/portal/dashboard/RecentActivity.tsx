"use client";

import React from "react";
import { User, Shield, Briefcase, Calendar } from "lucide-react";

interface ActivityItem {
  id: number;
  name: string;
  createdAt: string;
}

interface RecentActivityProps {
  beneficiaries: ActivityItem[];
  associations: ActivityItem[];
  marketers: ActivityItem[];
  isAr?: boolean;
}

export default function RecentActivity({
  beneficiaries = [],
  associations = [],
  marketers = [],
  isAr = true,
}: RecentActivityProps) {
  // Combine and sort activities by date desc
  const allActivities = [
    ...beneficiaries.map((b) => ({ ...b, type: "beneficiary" })),
    ...associations.map((a) => ({ ...a, type: "association" })),
    ...marketers.map((m) => ({ ...m, type: "marketer" })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper to format relative time
  const getRelativeTime = (dateStr: string) => {
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

  const getBadge = (type: string) => {
    return {
      beneficiary: {
        label: isAr ? "مستفيد" : "Beneficiary",
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
        icon: <User size={12} />,
      },
      association: {
        label: isAr ? "جمعية" : "Association",
        color: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
        icon: <Shield size={12} />,
      },
      marketer: {
        label: isAr ? "مسوق" : "Marketer",
        color: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
        icon: <Briefcase size={12} />,
      },
    }[type as "beneficiary" | "association" | "marketer"];
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Calendar size={16} className="text-slate-400" />
        <span>{isAr ? "النشاطات الأخيرة" : "Recent Activities"}</span>
      </h3>

      {allActivities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10 text-xs text-slate-400">
          {isAr ? "لا توجد نشاطات مؤخراً" : "No recent activity"}
        </div>
      ) : (
        <div className="space-y-4">
          {allActivities.slice(0, 5).map((activity, idx) => {
            const badge = getBadge(activity.type);
            return (
              <div key={idx} className="flex items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${badge.color}`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {activity.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 block">
                      {getRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold flex items-center gap-1 ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
