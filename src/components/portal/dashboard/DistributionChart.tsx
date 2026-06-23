"use client";

import React from "react";

interface DistributionChartProps {
  associations: number;
  beneficiaries: number;
  marketers: number;
  isAr?: boolean;
}

export default function DistributionChart({
  associations = 0,
  beneficiaries = 0,
  marketers = 0,
  isAr = true,
}: DistributionChartProps) {
  const total = associations + beneficiaries + marketers || 1;

  const pAssoc = associations / total;
  const pBen = beneficiaries / total;
  const pMark = marketers / total;

  // Donut chart calculations (Radius = 50, Circumference = 314.159)
  const r = 50;
  const circumference = 2 * Math.PI * r;

  // Stroke offsets
  const offsetAssoc = circumference * (1 - pAssoc);
  const offsetBen = circumference * (1 - pBen);
  const offsetMark = circumference * (1 - pMark);

  // Rotation angles to stack segments
  const angleAssoc = -90; // Start at 12 o'clock
  const angleBen = angleAssoc + pAssoc * 360;
  const angleMark = angleBen + pBen * 360;

  const data = [
    {
      label: isAr ? "المستفيدين" : "Beneficiaries",
      count: beneficiaries,
      percent: Math.round(pBen * 100),
      color: "stroke-emerald-500",
      bg: "bg-emerald-500",
      offset: offsetBen,
      angle: angleBen,
    },
    {
      label: isAr ? "الجمعيات" : "Associations",
      count: associations,
      percent: Math.round(pAssoc * 100),
      color: "stroke-blue-500",
      bg: "bg-blue-500",
      offset: offsetAssoc,
      angle: angleAssoc,
    },
    {
      label: isAr ? "المسوقين" : "Marketers",
      count: marketers,
      percent: Math.round(pMark * 100),
      color: "stroke-amber-500",
      bg: "bg-amber-500",
      offset: offsetMark,
      angle: angleMark,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
        {isAr ? "توزيع البيانات" : "Data Distribution"}
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Donut */}
        <div className="relative w-36 h-36">
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="-rotate-90">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="12"
              fill="none"
            />

            {/* Segments */}
            {data.map((item, idx) => (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={r}
                className={`${item.color} transition-all duration-500`}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={item.offset}
                strokeLinecap="round"
                transform={`rotate(${item.angle + 90} 60 60)`} // adjust starting angle
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {isAr ? "الإجمالي" : "Total"}
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {isAr ? (associations + beneficiaries + marketers).toLocaleString("ar-SA") : (associations + beneficiaries + marketers).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend / Details */}
        <div className="space-y-3.5 w-full sm:w-auto min-w-[120px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{item.label}</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
