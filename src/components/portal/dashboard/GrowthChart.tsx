"use client";

import React, { useState } from "react";

interface GrowthData {
  monthAr: string;
  monthEn: string;
  beneficiaries: number;
  marketers: number;
  associations: number;
}

interface GrowthChartProps {
  data: GrowthData[];
  isAr?: boolean;
}

export default function GrowthChart({ data = [], isAr = true }: GrowthChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{
    index: number;
    type: "beneficiary" | "marketer";
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const width = 500;
  const height = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingLeft = 40;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value in dataset to scale bars
  const values = data.flatMap((d) => [d.beneficiaries, d.marketers]);
  const maxVal = Math.max(...values, 10); // at least 10 for scale
  const scaleY = chartHeight / maxVal;

  const monthWidth = chartWidth / (data.length || 1);
  const barWidth = 14;

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isAr ? "معدل النمو الشهري" : "Monthly Growth Rate"}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isAr ? "مقارنة نمو المستفيدين والمسوقين" : "Comparing beneficiaries and marketers growth"}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>{isAr ? "المستفيدين" : "Beneficiaries"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>{isAr ? "المسوقين" : "Marketers"}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto select-none">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible min-w-[450px]"
        >
          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const gridVal = Math.round(maxVal * ratio);
            return (
              <g key={idx} className="opacity-40 dark:opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Y Axis Label */}
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  className="text-[9px] font-semibold fill-slate-400 text-end"
                  textAnchor="end"
                >
                  {isAr ? gridVal.toLocaleString("ar-SA") : gridVal}
                </text>
              </g>
            );
          })}

          {/* Bar Chart drawing */}
          {data.map((item, idx) => {
            const xCenter = paddingLeft + idx * monthWidth + monthWidth / 2;

            // Coordinates
            const benHeight = item.beneficiaries * scaleY;
            const benX = xCenter - barWidth - 2;
            const benY = height - paddingBottom - benHeight;

            const marHeight = item.marketers * scaleY;
            const marX = xCenter + 2;
            const marY = height - paddingBottom - marHeight;

            const monthName = isAr ? item.monthAr : item.monthEn;

            return (
              <g key={idx}>
                {/* Beneficiary Bar */}
                <rect
                  x={benX}
                  y={benY}
                  width={barWidth}
                  height={benHeight}
                  rx="3"
                  className="fill-emerald-500 hover:fill-emerald-600 transition-colors cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredBar({
                      index: idx,
                      type: "beneficiary",
                      value: item.beneficiaries,
                      x: benX + barWidth / 2,
                      y: benY - 10,
                    });
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Marketer Bar */}
                <rect
                  x={marX}
                  y={marY}
                  width={barWidth}
                  height={marHeight}
                  rx="3"
                  className="fill-amber-500 hover:fill-amber-600 transition-colors cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredBar({
                      index: idx,
                      type: "marketer",
                      value: item.marketers,
                      x: marX + barWidth / 2,
                      y: marY - 10,
                    });
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* X Axis Month Label */}
                <text
                  x={xCenter}
                  y={height - paddingBottom + 16}
                  className="text-[10px] font-bold fill-slate-400 text-center"
                  textAnchor="middle"
                >
                  {monthName}
                </text>
              </g>
            );
          })}

          {/* X Axis Line */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            className="dark:stroke-slate-700"
          />

          {/* Interactive Tooltip inside SVG */}
          {hoveredBar && (
            <g>
              {/* Tooltip Background */}
              <rect
                x={hoveredBar.x - 30}
                y={hoveredBar.y - 25}
                width="60"
                height="20"
                rx="6"
                className="fill-slate-900 dark:fill-slate-800"
              />
              {/* Tooltip text */}
              <text
                x={hoveredBar.x}
                y={hoveredBar.y - 12}
                className="text-[9px] font-bold fill-white text-center"
                textAnchor="middle"
              >
                {hoveredBar.value}
              </text>
              {/* Arrow */}
              <polygon
                points={`${hoveredBar.x - 4},${hoveredBar.y - 5} ${hoveredBar.x + 4},${hoveredBar.y - 5} ${hoveredBar.x},${hoveredBar.y}`}
                className="fill-slate-900 dark:fill-slate-800"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
