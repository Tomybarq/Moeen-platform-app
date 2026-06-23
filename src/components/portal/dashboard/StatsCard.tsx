"use client";

import React from "react";

interface StatsCardProps {
  label: string;
  value: number;
  history: number[];
  color: "blue" | "emerald" | "amber" | "purple";
  iconText: string;
  isAr?: boolean;
}

export default function StatsCard({
  label,
  value,
  history = [],
  color = "blue",
  iconText = "#",
  isAr = true,
}: StatsCardProps) {
  // Sparkline coordinates mapping
  const width = 100;
  const height = 30;
  
  let points = "";
  if (history.length > 1) {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    
    points = history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * width;
        // Map value to height, leaving 3px padding top/bottom
        const y = height - 3 - ((val - min) / range) * (height - 6);
        return `${x},${y}`;
      })
      .join(" ");
  }

  const themes = {
    blue: {
      bg: "bg-blue-50/50 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-950/30",
      stroke: "stroke-blue-500 dark:stroke-blue-400",
      fill: "fill-blue-500/10",
      iconBg: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    },
    emerald: {
      bg: "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30",
      stroke: "stroke-emerald-500 dark:stroke-emerald-400",
      fill: "fill-emerald-500/10",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      bg: "bg-amber-50/50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-950/30",
      stroke: "stroke-amber-500 dark:stroke-amber-400",
      fill: "fill-amber-500/10",
      iconBg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    },
    purple: {
      bg: "bg-purple-50/50 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-950/30",
      stroke: "stroke-purple-500 dark:stroke-purple-400",
      fill: "fill-purple-500/10",
      iconBg: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
    },
  }[color];

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAr ? value.toLocaleString("ar-SA") : value.toLocaleString()}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${themes.iconBg}`}>
          {iconText}
        </div>
      </div>

      {/* Sparkline & trend */}
      <div className="flex items-end justify-between mt-4">
        {points ? (
          <div className="w-24 h-8">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              {/* Fill Area */}
              <path
                d={`M 0,${height} L ${points} L ${width},${height} Z`}
                className={themes.fill}
              />
              {/* Stroke line */}
              <polyline
                fill="none"
                className={themes.stroke}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="h-8 w-24 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
        )}
        
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          {isAr ? "آخر ٦ أشهر" : "Last 6 months"}
        </span>
      </div>
    </div>
  );
}
