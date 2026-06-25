import { getSession } from "@/lib/auth";
import { getLiveDashboardStats } from "@/lib/dashboard-service";
import DashboardClient from "@/components/portal/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // منع الكاش لضمان الأمان والبيانات الحية

export default async function PortalDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  try {
    const stats = await getLiveDashboardStats();
    const userName = session.name || "المستخدم";

    return (
      <DashboardClient
        initialStats={stats}
        userName={userName}
        locale={locale}
      />
    );
  } catch (error) {
    console.error("خطأ في جلب بيانات لوحة التحكم:", error);
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50" dir={locale === "ar" ? "rtl" : "ltr"}>
        <p className="font-bold text-lg">تنبيه حماية النظام / System Security Alert</p>
        <p className="mt-2 text-sm">
          {locale === "ar"
            ? "عذراً، فشل تحميل لوحة البيانات الحية بسبب خطأ في التحقق من أمن مستوى الصف (RLS). يرجى تسجيل الدخول مرة أخرى."
            : "Sorry, failed to load the live dashboard due to a Row-Level Security (RLS) validation error. Please log in again."}
        </p>
      </div>
    );
  }
}
