"use client";

import React, { useState } from "react";
import { AddButton, EditButton, BulkActionMenu } from "@/components/ui/ActionButtons";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";

interface Marketer {
  id: number;
  name: string;
  createdAt: string;
}

interface MarketersClientProps {
  initialMarketers: Marketer[];
  title: string;
  emptyMessage: string;
  nameLabel: string;
  createdAtLabel: string;
  locale: string;
}

export default function MarketersClient({
  initialMarketers,
  title,
  emptyMessage,
  nameLabel,
  createdAtLabel,
  locale,
}: MarketersClientProps) {
  const [marketers, setMarketers] = useState(initialMarketers);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const path = "/portal/marketers";
  const isAr = locale === "ar";

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(marketers.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkAction = (action: "delete" | "archive") => {
    const isAr = locale === "ar";
    if (action === "delete") {
      showToast(
        isAr
          ? `تم حذف العناصر المحددة: ${selectedIds.join(", ")}`
          : `Deleted selected items: ${selectedIds.join(", ")}`,
        "success"
      );
      setMarketers((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    } else {
      showToast(
        isAr
          ? `تم أرشفة العناصر المحددة: ${selectedIds.join(", ")}`
          : `Archived selected items: ${selectedIds.join(", ")}`,
        "success"
      );
      setSelectedIds([]);
    }
  };

  const handleAddClick = () => {
    showToast(isAr ? "تم النقر على زر إضافة مسوق جديد" : "Clicked add new marketer button", "info");
  };

  const handleEditClick = (id: number, name: string) => {
    showToast(isAr ? `تعديل المسوق: ${name} (ID: ${id})` : `Editing marketer: ${name} (ID: ${id})`, "info");
  };

  return (
    <div className="space-y-6">

      {/* Title block */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {/* Buttons section directly under title */}
        <div className="flex items-center gap-3 mt-4">
          {hasPermission(path, "create") && (
            <AddButton
              label={locale === "ar" ? "إضافة مسوق" : "Add Marketer"}
              onClick={handleAddClick}
            />
          )}
          <BulkActionMenu
            selectedIds={selectedIds}
            onAction={handleBulkAction}
            showDelete={hasPermission(path, "delete")}
            showArchive={hasPermission(path, "archive")}
            labels={{
              delete: locale === "ar" ? "حذف" : "Delete",
              archive: locale === "ar" ? "أرشفة" : "Archive",
              settings:
                locale === "ar" ? "خيارات الحذف والأرشفة" : "Delete/Archive Options",
            }}
          />
        </div>
      </div>

      {/* Table block */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {marketers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <th className="p-4 text-start w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === marketers.length && marketers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 accent-primary dark:accent-tertiary cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-start font-bold">ID</th>
                  <th className="p-4 text-start font-bold">{nameLabel}</th>
                  <th className="p-4 text-start font-bold">{createdAtLabel}</th>
                  <th className="p-4 text-start font-bold w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {marketers.map((marketer) => (
                  <tr
                    key={marketer.id}
                    className={`text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-colors ${
                      selectedIds.includes(marketer.id) ? "bg-primary/5 dark:bg-tertiary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(marketer.id)}
                        onChange={(e) => handleSelectRow(marketer.id, e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 accent-primary dark:accent-tertiary cursor-pointer"
                      />
                    </td>
                    <td className="p-4">{marketer.id}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {marketer.name}
                    </td>
                    <td className="p-4">{new Date(marketer.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-end">
                      {hasPermission(path, "edit") && (
                        <EditButton
                          label={locale === "ar" ? "تعديل" : "Edit"}
                          onClick={() => handleEditClick(marketer.id, marketer.name)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
