"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useParams } from "next/navigation";

export default function GeneralSettingsPage() {
  const t = useTranslations("settings");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "ar";
  const isAr = currentLocale === "ar";

  const handleLanguageChange = (locale: "ar" | "en") => {
    fetch("/api/users/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: locale }),
    })
      .catch((err) => console.error("Failed to sync language preference:", err))
      .finally(() => {
        router.replace(pathname, { locale });
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Theme select */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("theme")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? "تخصيص ثيم الألوان العام للمنصة" : "Customize the platform's theme color"}
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800/80" />

        {/* Language select */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("language")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? "تغيير لغة العرض والواجهات" : "Switch interface display language"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentLocale === "ar"
                  ? "bg-primary/10 border-primary/20 text-primary dark:bg-tertiary/10 dark:border-tertiary/20 dark:text-tertiary"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentLocale === "en"
                  ? "bg-primary/10 border-primary/20 text-primary dark:bg-tertiary/10 dark:border-tertiary/20 dark:text-tertiary"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
