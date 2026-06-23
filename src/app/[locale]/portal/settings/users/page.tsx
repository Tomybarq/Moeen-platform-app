"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, X, Plus, Users } from "lucide-react";
import { AddButton, EditButton, BulkActionMenu } from "@/components/ui/ActionButtons";
import UserPermissionsModal from "@/components/portal/UserPermissionsModal";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";

interface UserRecord {
  id: number;
  email: string;
  name: string | null;
  roleId: number;
  role: { name: string; nameAr?: string | null; type?: string };
  status: string;
}

interface RoleRecord {
  id: number;
  name: string;
  nameAr?: string | null;
  type?: string;
}

interface ScreenRecord {
  id: number;
  name: string;
  nameAr?: string | null;
  path: string;
}

export default function UsersSettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const params = useParams();
  const currentLocale = (params?.locale as string) || "ar";
  const isAr = currentLocale === "ar";
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const path = "/portal/settings/users";

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [screens, setScreens] = useState<ScreenRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isUserPermsOpen, setIsUserPermsOpen] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<{ id: number; name: string } | null>(null);

  // Edit user states
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState<number>(0);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const loadUsersData = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRolesAndScreensData = async () => {
    try {
      const [resRoles, resScreens] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/screens"),
      ]);
      const dataRoles = await resRoles.json();
      const dataScreens = await resScreens.json();
      if (dataRoles.roles) setRoles(dataRoles.roles);
      if (dataScreens.screens) setScreens(dataScreens.screens);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsersData();
    loadRolesAndScreensData();
  }, []);

  const selectableUsers = users.filter(
    (u) => !(u.role?.type === "admin" || u.role?.type === "superadmin")
  );
  const isAllSelectableChecked =
    selectableUsers.length > 0 && selectableUsers.every((u) => selectedUserIds.includes(u.id));

  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(selectableUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUserRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, id]);
    } else {
      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleUserBulkAction = (action: "delete" | "archive") => {
    if (action === "delete") {
      showToast(
        isAr
          ? `تم حذف المستخدمين المحددين: ${selectedUserIds.join(", ")}`
          : `Deleted selected users: ${selectedUserIds.join(", ")}`,
        "success"
      );
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
    } else {
      showToast(
        isAr
          ? `تم أرشفة المستخدمين المحددين: ${selectedUserIds.join(", ")}`
          : `Archived selected users: ${selectedUserIds.join(", ")}`,
        "success"
      );
      setSelectedUserIds([]);
    }
  };

  const handleAddUserClick = () => {
    showToast(isAr ? "تم النقر على زر إضافة مستخدم جديد" : "Clicked add new user button", "info");
  };

  const handleEditUserClick = (targetUserRecord: UserRecord) => {
    setUserToEdit(targetUserRecord);
    setEditName(targetUserRecord.name || "");
    setEditEmail(targetUserRecord.email || "");
    setEditRoleId(targetUserRecord.roleId);
    setIsEditUserOpen(true);
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/users/${userToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          roleId: editRoleId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isAr ? "تم تحديث بيانات المستخدم بنجاح" : "User updated successfully", "success");
        setUsers((prev) =>
          prev.map((u) => (u.id === userToEdit.id ? { ...u, name: editName, email: editEmail, roleId: editRoleId, role: data.user.role } : u))
        );
        setIsEditUserOpen(false);
        setUserToEdit(null);
      } else {
        showToast(data.error || "Failed to update user", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleUserRoleChange = async (userId: number, roleId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isAr ? "تم تحديث دور المستخدم بنجاح" : "User role updated successfully", "success");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, roleId, role: data.user.role } : u))
        );
      } else {
        showToast(data.error || "Failed to update role", "error");
        loadUsersData();
      }
    } catch (err) {
      showToast("Network error", "error");
      loadUsersData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {isAr ? "المستخدمين" : "Users"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isAr ? "إدارة وتعديل مستخدمي المنصة وتخصيص صلاحياتهم الاستثنائية" : "Manage platform users and customize their override permissions"}
        </p>
        <div className="flex items-center gap-3 mt-4">
          {hasPermission(path, "create") && (
            <AddButton
              label={isAr ? "إضافة مستخدم" : "Add User"}
              onClick={handleAddUserClick}
            />
          )}
          <BulkActionMenu
            selectedIds={selectedUserIds}
            onAction={handleUserBulkAction}
            showDelete={hasPermission(path, "delete")}
            showArchive={hasPermission(path, "archive")}
            labels={{
              delete: isAr ? "حذف" : "Delete",
              archive: isAr ? "أرشفة" : "Archive",
              settings: isAr ? "خيارات الحذف والأرشفة" : "Delete/Archive Options",
            }}
          />
        </div>
      </div>

      {loadingUsers ? (
        <TableSkeleton rowCount={4} />
      ) : (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-150/40 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                <Users size={30} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {isAr ? "لا يوجد مستخدمون مضافون حالياً" : "No Users Registered Yet"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                {isAr
                  ? "لم يتم العثور على أي مستخدمين مسجلين في النظام. يمكنك إضافة مستخدمين لتعيين أدوارهم وصلاحياتهم."
                  : "No registered users were found in the system. You can add users to assign their roles and permissions."}
              </p>
              {hasPermission(path, "create") && (
                <button
                  onClick={handleAddUserClick}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary dark:bg-tertiary dark:text-slate-900 hover:opacity-90 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>{isAr ? "إضافة مستخدم جديد" : "Add New User"}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                    <th className="p-4 text-start w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelectableChecked}
                        onChange={handleSelectAllUsers}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 accent-primary dark:accent-tertiary cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-start">{isAr ? "الاسم" : "Name"}</th>
                    <th className="p-4 text-start">{isAr ? "البريد الإلكتروني" : "Email"}</th>
                    <th className="p-4 text-start">{isAr ? "نوع المستخدم" : "User Type"}</th>
                    <th className="p-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                    <th className="p-4 text-start w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-colors ${
                        selectedUserIds.includes(u.id) ? "bg-primary/5 dark:bg-tertiary/5" : ""
                      }`}
                    >
                      <td className="p-4 text-start">
                        <input
                          type="checkbox"
                          disabled={u.role?.type === "admin" || u.role?.type === "superadmin"}
                          checked={selectedUserIds.includes(u.id)}
                          onChange={(e) => handleSelectUserRow(u.id, e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 accent-primary dark:accent-tertiary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white text-start">
                        {u.name || "-"}
                      </td>
                      <td className="p-4 text-start">{u.email}</td>
                      <td className="p-4 text-start">
                        <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-355 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                          {isAr && u.role?.nameAr ? u.role.nameAr : u.role?.name}
                        </span>
                      </td>
                      <td className="p-4 text-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                          {u.status === "active" ? (isAr ? "نشط" : "Active") : u.status}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                        {hasPermission(path, "edit") && (
                          <>
                            {user?.roleType === "superadmin" && u.role?.type !== "superadmin" && (
                              <button
                                onClick={() => {
                                  setSelectedUserForPerms({ id: u.id, name: u.name || u.email });
                                  setIsUserPermsOpen(true);
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-primary dark:text-tertiary hover:opacity-85 bg-primary/5 dark:bg-tertiary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 dark:border-tertiary/10 transition-all cursor-pointer"
                                title={isAr ? "تعديل الصلاحيات الاستثنائية للمستخدم" : "Edit custom user permissions"}
                              >
                                <ShieldAlert size={12} />
                                <span>{isAr ? "صلاحيات خاصة" : "Custom Perms"}</span>
                              </button>
                            )}
                            {u.role?.type !== "superadmin" && (
                              ((u.role?.type === "admin" && user?.roleType === "superadmin") ||
                               (u.role?.type !== "admin"))
                            ) && (
                              <EditButton
                                label={isAr ? "تعديل" : "Edit"}
                                onClick={() => handleEditUserClick(u)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

      {isUserPermsOpen && selectedUserForPerms && (
        <UserPermissionsModal
          isOpen={isUserPermsOpen}
          onClose={() => {
            setIsUserPermsOpen(false);
            setSelectedUserForPerms(null);
          }}
          userId={selectedUserForPerms.id}
          userName={selectedUserForPerms.name}
          screens={screens}
          isAr={isAr}
        />
      )}

      {isEditUserOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "تعديل بيانات المستخدم" : "Edit User Data"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditUserOpen(false);
                  setUserToEdit(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {isAr ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2.5 text-slate-850 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {isAr ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2.5 text-slate-850 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                  {isAr ? "نوع المستخدم" : "User Type"}
                </label>
                <select
                  disabled={userToEdit?.role?.type === "admin" || userToEdit?.role?.type === "superadmin"}
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2.5 text-slate-855 dark:text-slate-245 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {isAr && r.nameAr ? r.nameAr : r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserOpen(false);
                    setUserToEdit(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-2 bg-primary dark:bg-tertiary text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
                >
                  {submittingEdit && (
                    <div className="w-3.5 h-3.5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
