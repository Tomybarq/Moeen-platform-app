"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Shield, Lock } from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface Screen {
  id: number;
  name: string;
  nameAr?: string | null;
  path: string;
}

interface PermissionEntry {
  screenId: number;
  actions: string[];
}

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  screens: Screen[];
  isAr: boolean;
}

const AVAILABLE_ACTIONS = [
  { value: "view", labelAr: "عرض", labelEn: "View", activeColor: "bg-tertiary/10 text-tertiary border-tertiary/30 dark:bg-tertiary/20" },
  { value: "create", labelAr: "إضافة", labelEn: "Create", activeColor: "bg-primary/10 text-primary border-primary/30 dark:bg-primary/20" },
  { value: "edit", labelAr: "تعديل", labelEn: "Edit", activeColor: "bg-[#F9A826]/10 text-[#F9A826] border-[#F9A826]/30 dark:bg-[#F9A826]/20" },
  { value: "delete", labelAr: "حذف", labelEn: "Delete", activeColor: "bg-rose-500/10 text-rose-500 border-rose-500/30 dark:bg-rose-500/20" },
  { value: "archive", labelAr: "أرشفة", labelEn: "Archive", activeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/20" },
];

export default function UserPermissionsModal({
  isOpen,
  onClose,
  userId,
  userName,
  screens,
  isAr,
}: UserPermissionsModalProps) {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<PermissionEntry[]>([]);
  const [rolePermissions, setRolePermissions] = useState<PermissionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user permissions on mount
  useEffect(() => {
    if (!isOpen) return;

    const fetchPermissions = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/users/${userId}/permissions`);
        const data = await res.json();
        if (res.ok) {
          setRolePermissions(data.rolePermissions || []);
          setEntries(
            (data.directPermissions || []).map((p: any) => ({
              screenId: p.screenId,
              actions: p.actions || [],
            }))
          );
        } else {
          setErrorMsg(data.error || "Failed to load permissions");
        }
      } catch (err) {
        setErrorMsg("Failed to load permissions due to a network error");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const handleAddEntry = () => {
    // Find the first screen that isn't already added directly
    const alreadyAdded = entries.map((e) => e.screenId);
    const available = screens.find((s) => !alreadyAdded.includes(s.id));
    
    if (!available && screens.length > 0) {
      setErrorMsg(
        isAr
          ? "لقد قمت بإضافة جميع الشاشات المتاحة بالفعل"
          : "All available screens have already been added"
      );
      return;
    }

    setEntries((prev) => [
      ...prev,
      {
        screenId: available ? available.id : (screens[0]?.id || 0),
        actions: [],
      },
    ]);
    setErrorMsg(null);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setErrorMsg(null);
  };

  const handleScreenChange = (index: number, screenId: number) => {
    // Prevent selecting a duplicate screen
    const duplicate = entries.some((e, i) => e.screenId === screenId && i !== index);
    if (duplicate) {
      setErrorMsg(
        isAr
          ? "هذه الشاشة مضافة بالفعل في قائمة الصلاحيات الخاصة"
          : "This screen is already in the custom permissions list"
      );
      return;
    }

    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], screenId, actions: [] };
      return copy;
    });
    setErrorMsg(null);
  };

  const handleActionToggle = (index: number, actionValue: string, isInherited: boolean) => {
    if (isInherited) return; // Cannot toggle role inherited actions

    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const currentActions = entry.actions;
        const updatedActions = currentActions.includes(actionValue)
          ? currentActions.filter((a) => a !== actionValue)
          : [...currentActions, actionValue];
        return { ...entry, actions: updatedActions };
      })
    );
    setErrorMsg(null);
  };

  // Check if action is inherited from user's role
  const checkIsInherited = (screenId: number, actionValue: string) => {
    const roleEntry = rolePermissions.find((rp) => rp.screenId === screenId);
    return roleEntry ? roleEntry.actions.includes(actionValue) : false;
  };

  const handleSave = async () => {
    // Validation
    const screenIds = entries.map((e) => e.screenId);
    const duplicates = screenIds.filter((id, index) => screenIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      setErrorMsg(
        isAr
          ? "يرجى إزالة الشاشات المكررة"
          : "Please remove duplicate screens"
      );
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: entries }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          isAr ? "تم حفظ الصلاحيات الخاصة بنجاح" : "Custom permissions saved successfully",
          "success"
        );
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to save permissions");
      }
    } catch (err) {
      setErrorMsg("Failed to save permissions due to a network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-start">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-tertiary/10 flex items-center justify-center text-primary dark:text-tertiary">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? "الصلاحيات الاستثنائية للمستخدم" : "Custom User Permissions"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {isAr ? `تعديل صلاحيات الوصول المباشرة لـ: ${userName}` : `Modify direct access overrides for: ${userName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? "جاري تحميل صلاحيات المستخدم..." : "Loading user permissions..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? "صلاحيات الشاشات والأزرار الإضافية" : "Additional Screen & Button Permissions"}
                </span>
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary dark:text-tertiary hover:opacity-90 bg-primary/5 dark:bg-tertiary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 dark:border-tertiary/10 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  {isAr ? "إضافة شاشة استثنائية" : "Add Custom Screen"}
                </button>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10">
                  <Shield className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={28} />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                    {isAr
                      ? "لا توجد صلاحيات استثنائية مضافة حالياً. يرث المستخدم صلاحيات دوره الافتراضية فقط."
                      : "No direct custom permissions assigned yet. User inherits role permissions only."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/80 rounded-xl relative group"
                    >
                      {/* Screen Selector */}
                      <div className="w-full md:w-1/3 space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {isAr ? "الشاشة" : "Screen"}
                        </label>
                        <select
                          value={entry.screenId}
                          onChange={(e) => handleScreenChange(index, parseInt(e.target.value))}
                          className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2.5 py-2 text-slate-850 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                        >
                          {screens.map((s) => (
                            <option key={s.id} value={s.id}>
                              {isAr && s.nameAr ? s.nameAr : s.name} ({s.path})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Actions Multi-Select */}
                      <div className="flex-1 space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {isAr ? "صلاحيات الأزرار (اضغط لمنح إضافي)" : "Button Actions (Click to grant override)"}
                        </label>
                        <div className="flex flex-wrap gap-1.5 py-0.5">
                          {AVAILABLE_ACTIONS.map((action) => {
                            const isInherited = checkIsInherited(entry.screenId, action.value);
                            const isActive = isInherited || entry.actions.includes(action.value);
                            
                            return (
                              <button
                                key={action.value}
                                type="button"
                                onClick={() => handleActionToggle(index, action.value, isInherited)}
                                disabled={isInherited}
                                className={`
                                  flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border transition-all
                                  ${isInherited 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 cursor-not-allowed opacity-85"
                                    : isActive
                                      ? action.activeColor
                                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600 cursor-pointer"
                                  }
                                `}
                              >
                                {isInherited && <Lock size={9} />}
                                <span>{isAr ? action.labelAr : action.labelEn}</span>
                                {isInherited && (
                                  <span className="text-[8px] opacity-75 font-normal">
                                    ({isAr ? "موروث" : "inherited"})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(index)}
                        className="md:self-end text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                        title={isAr ? "حذف الشاشة" : "Remove screen"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 text-xs font-bold text-white bg-primary dark:bg-tertiary hover:opacity-90 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isAr ? "جاري الحفظ..." : "Saving..."}
              </>
            ) : (
              isAr ? "حفظ التغييرات" : "Save Changes"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
