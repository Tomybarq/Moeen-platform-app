"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, Globe, User, Bell, CheckCheck, Info, AlertTriangle, Check } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";

interface HeaderProps {
  locale: string;
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  titleAr: string | null;
  message: string;
  messageAr: string | null;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export default function Header({ locale, onMenuClick }: HeaderProps) {
  const isAr = locale === "ar";
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  // حالات التنبيهات
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // جلب التنبيهات من الخادم
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (response.ok && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // فحص دوري كل 30 ثانية لتحديث قائمة التنبيهات (محاكاة التنبيهات الحية)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // إغلاق القائمة المنسدلة عند النقر بالخارج
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // تعيين كافة التنبيهات كمقروءة
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // تعيين تنبيه محدد كمقروء
  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const switchLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    fetch("/api/users/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: nextLocale }),
    })
      .catch((err) => console.error("Failed to sync language preference:", err))
      .finally(() => {
        router.replace(pathname, { locale: nextLocale });
      });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check size={14} className="stroke-[2.5]" />;
      case "warning":
        return <AlertTriangle size={14} className="stroke-[2.5]" />;
      case "error":
        return <AlertTriangle size={14} className="stroke-[2.5] text-rose-500" />;
      default:
        return <Info size={14} className="stroke-[2.5]" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = new Date().getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffMin < 1) return isAr ? "الآن" : "Just now";
      if (diffMin < 60) return isAr ? `منذ ${diffMin} د` : `${diffMin}m ago`;
      if (diffHr < 24) return isAr ? `منذ ${diffHr} س` : `${diffHr}h ago`;
      return isAr ? `منذ ${diffDay} ي` : `${diffDay}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">
          {t("appName")}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle variant="pill" />

        {/* Language Switcher */}
        <button
          onClick={switchLanguage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Globe size={16} />
          <span>{locale === "ar" ? "English" : "العربية"}</span>
        </button>

        {/* جرس التنبيهات Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer relative"
            title={isAr ? "التنبيهات" : "Notifications"}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-[#0F172A]">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-start">
              {/* رأس القائمة */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
                <span className="text-xs font-bold text-slate-850 dark:text-white">
                  {isAr ? "التنبيهات" : "Notifications"}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-primary dark:text-tertiary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
                  </button>
                )}
              </div>

              {/* قائمة التنبيهات */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {isAr ? "لا توجد تنبيهات جديدة" : "No new notifications"}
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                      className={`p-4 flex gap-3 text-xs cursor-pointer transition-colors ${
                        notif.read
                          ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-850/30"
                          : "bg-primary/5 dark:bg-tertiary/5 hover:bg-primary/10 dark:hover:bg-tertiary/10"
                      }`}
                    >
                      {/* دائرة الأيقونة حسب نوع التنبيه */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === "success"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450"
                            : notif.type === "warning"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450"
                            : notif.type === "error"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-450"
                        }`}
                      >
                        {getIcon(notif.type)}
                      </div>

                      {/* المحتوى */}
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-semibold text-slate-850 dark:text-white leading-normal ${!notif.read ? "font-bold" : ""}`}>
                            {isAr ? notif.titleAr || notif.title : notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-tertiary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-normal text-[11px]">
                          {isAr ? notif.messageAr || notif.message : notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={16} />
          )}
        </div>
      </div>
    </header>
  );
}
