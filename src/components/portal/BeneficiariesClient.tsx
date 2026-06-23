"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AddButton, EditButton } from "@/components/ui/ActionButtons";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Trash2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface Beneficiary {
  id: number;
  name: string;
  image?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface BeneficiariesClientProps {
  locale: string;
}

const LIMIT = 10;
const PATH = "/portal/beneficiaries";

export default function BeneficiariesClient({ locale }: BeneficiariesClientProps) {
  const isAr = locale === "ar";
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  // List state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Beneficiary | null>(null);
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteItem, setDeleteItem] = useState<Beneficiary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/beneficiaries?search=${encodeURIComponent(q)}&page=${p}&limit=${LIMIT}`);
      const data = await response.json();
      if (response.ok) {
        setBeneficiaries(data.beneficiaries || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        showToast(data.error || (isAr ? "حدث خطأ أثناء جلب البيانات" : "Failed to fetch data"), "error");
      }
    } catch (err) {
      showToast(isAr ? "خطأ في الاتصال بالخادم" : "Server connection error", "error");
    } finally {
      setLoading(false);
    }
  }, [isAr, showToast]);

  useEffect(() => {
    fetchData(search, page);
  }, [search, page, fetchData]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // ── Create / Update ────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditItem(null);
    setFormName("");
    setFormImage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Beneficiary) => {
    setEditItem(item);
    setFormName(item.name);
    setFormImage(item.image || null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim().length < 3) {
      showToast(
        isAr ? "اسم المستفيد يجب أن يكون 3 أحرف على الأقل" : "Beneficiary name must be at least 3 characters",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      const url = editItem ? `/api/beneficiaries/${editItem.id}` : "/api/beneficiaries";
      const method = editItem ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, image: formImage }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast(
          isAr
            ? editItem
              ? "تم تعديل المستفيد بنجاح"
              : "تم إضافة المستفيد بنجاح"
            : editItem
            ? "Beneficiary updated successfully"
            : "Beneficiary added successfully",
          "success"
        );
        setModalOpen(false);
        fetchData(search, page);
      } else {
        showToast(data.error || (isAr ? "فشلت العملية" : "Operation failed"), "error");
      }
    } catch (err) {
      showToast(isAr ? "خطأ في الاتصال بالخادم" : "Server connection error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleOpenDelete = (item: Beneficiary) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/beneficiaries/${deleteItem.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        showToast(isAr ? "تم حذف المستفيد بنجاح" : "Beneficiary deleted successfully", "success");
        setDeleteItem(null);
        const newPage = beneficiaries.length === 1 && page > 1 ? page - 1 : page;
        setPage(newPage);
        fetchData(search, newPage);
      } else {
        showToast(data.error || (isAr ? "فشل حذف المستفيد" : "Failed to delete beneficiary"), "error");
      }
    } catch (err) {
      showToast(isAr ? "خطأ في الاتصال بالخادم" : "Server connection error", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isAr ? "إدارة المستفيدين" : "Manage Beneficiaries"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? `إجمالي المستفيدين: ${total}` : `Total Beneficiaries: ${total}`}
          </p>
        </div>
        {hasPermission(PATH, "create") && (
          <AddButton
            label={isAr ? "إضافة مستفيد" : "Add Beneficiary"}
            onClick={handleOpenAdd}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={isAr ? "البحث عن مستفيد..." : "Search beneficiaries..."}
          className="w-full sm:max-w-xs"
        />
      </div>

      {/* Table Section */}
      <div className="w-full">
        {loading ? (
          <TableSkeleton rowCount={5} />
        ) : beneficiaries.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <EmptyState
              title={isAr ? "لا توجد نتائج" : "No results found"}
              description={isAr ? "لم نجد أي مستفيد تطابق معايير بحثك." : "We couldn't find any beneficiaries matching your query."}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    <th className="p-4 text-start w-16">#</th>
                    <th className="p-4 text-start">{isAr ? "المستفيد" : "Beneficiary"}</th>
                    <th className="p-4 text-start">{isAr ? "تاريخ الإضافة" : "Created At"}</th>
                    <th className="p-4 text-end w-32">{isAr ? "العمليات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {beneficiaries.map((ben, idx) => (
                    <tr
                      key={ben.id}
                      className="text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-colors"
                    >
                      <td className="p-4 font-semibold text-slate-400">{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {ben.image ? (
                            <img
                              src={ben.image}
                              alt={ben.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                              <span className="text-xs font-bold">{ben.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <span className="font-medium text-slate-900 dark:text-white">{ben.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(ben.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission(PATH, "edit") && (
                            <EditButton
                              label={isAr ? "تعديل" : "Edit"}
                              onClick={() => handleOpenEdit(ben)}
                            />
                          )}
                          {hasPermission(PATH, "delete") && (
                            <button
                              onClick={() => handleOpenDelete(ben)}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                              title={isAr ? "حذف" : "Delete"}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isAr={isAr}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? (isAr ? "تعديل مستفيد" : "Edit Beneficiary") : (isAr ? "إضافة مستفيد جديد" : "Add New Beneficiary")}
      >
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? "صورة المستفيد" : "Beneficiary Image"}
            </label>
            <ImageUpload
              value={formImage}
              onChange={setFormImage}
              type="beneficiaries"
              isAr={isAr}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? "اسم المستفيد" : "Beneficiary Name"}
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={isAr ? "مثال: أحمد محمد العتيبي" : "e.g. Ahmad Al-Otaibi"}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isAr ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title={isAr ? "تأكيد الحذف" : "Confirm Delete"}
        message={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف المستفيد "${deleteItem?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete beneficiary "${deleteItem?.name}"? This action cannot be undone.`
        }
        confirmLabel={isAr ? "حذف" : "Delete"}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
      />
    </div>
  );
}
