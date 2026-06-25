"use client";

import React from "react";
import { TrendingUp, Users, Target } from "lucide-react";

interface KPISectionProps {
  associations: number;
  beneficiaries: number;
  marketers: number;
  isAr?: boolean;
}

export default function KPISection({
  associations = 0,
  beneficiaries = 0,
  marketers = 0,
  isAr = true,
}: KPISectionProps) {
  // Calculations
  const assocDivider = associations || 1;
  const avgBensPerAssoc = (beneficiaries / assocDivider).toFixed(1);
  const avgMarketersPerAssoc = (marketers / assocDivider).toFixed(1);

  // Coverage targets
  const targetCoverage = 100;
  const coveragePercent = Math.min(Math.round((beneficiaries / targetCoverage) * 100), 100);

  const kpis = [
    {
      label: isAr ? "متوسط المستفيدين / جمعية" : "Avg Beneficiaries / Charity",
      value: avgBensPerAssoc,
      icon: <Users size={16} />,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
      desc: isAr ? "مؤشر التغطية لكل جمعية" : "Coverage indicator per charity",
    },
    {
      label: isAr ? "متوسط المسوقين / جمعية" : "Avg Marketers / Charity",
      value: avgMarketersPerAssoc,
      icon: <TrendingUp size={16} />,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
      desc: isAr ? "مؤشر التسويق النشط" : "Active marketing ratio",
    },
    {
      label: isAr ? "معدل تحقيق الهدف العام" : "Goal Achievement Rate",
      value: `${coveragePercent}%`,
      icon: <Target size={16} />,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
      desc: isAr ? "النسبة المحققة من الهدف السنوي" : "Achievement of annual target",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
            {kpi.icon}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">
              {kpi.label}
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {kpi.value}
            </h4>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
              {kpi.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
