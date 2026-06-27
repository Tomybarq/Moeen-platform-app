import React from "react";
import { getTranslations } from "next-intl/server";
import { BarChart3, Rocket, Share2, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/ui/ContactForm";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  return {
    title: t("title"),
    description: t("subheadline"),
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
      
      {/* Marketing Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Teal asset token "م" logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-primary/10">
              {isAr ? "م" : "M"}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight">
                {isAr ? "منصة معين" : "Moeen Platform"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <Link
              href="#contact"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-tertiary transition-colors hidden sm:inline-block"
            >
              {t("cta_primary")}
            </Link>

            <Link
              href={`/${locale}/login`}
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              {isAr ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-slate-200 dark:border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.08),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* SaaS Compliance Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/30 text-[10px] font-bold text-teal-700 dark:text-teal-400 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-subtle" />
            {isAr ? "ممتثل لمعايير الحوسبة السحابية المؤسسية KSA" : "Enterprise SaaS Criteria Compliant KSA"}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight max-w-4xl mx-auto mb-6">
            {t("headline")}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            {t("subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#contact"
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("cta_primary")}</span>
              {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </Link>

            <Link
              href={`/${locale}/login`}
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAr ? "الدخول للبوابة السحابية" : "Enter Cloud Portal"}</span>
              <ArrowDown size={14} className="animate-bounce" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Features Grid */}
      <section className="py-20 lg:py-28 bg-white dark:bg-[#0F172A]/30 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
              {t("features_title")}
            </h3>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col items-start text-start">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 text-primary dark:text-teal-400 rounded-xl flex items-center justify-center mb-6">
                <Rocket size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {t("feature_1_title")}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature_1_desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col items-start text-start">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 text-primary dark:text-teal-400 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {t("feature_2_title")}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature_2_desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col items-start text-start">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 text-primary dark:text-teal-400 rounded-xl flex items-center justify-center mb-6">
                <Share2 size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {t("feature_3_title")}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("feature_3_desc")}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Contact & Conversion Zone */}
      <section id="contact" className="py-20 lg:py-28 bg-slate-900 dark:bg-[#090D16] text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.15),transparent_40%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">
              {t("contact_title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t("contact_subtitle")}
            </p>
          </div>

          <div className="w-full">
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 border-t border-slate-900 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} {isAr ? "مؤسسة معين الرقمية التجارية. جميع الحقوق محفوظة." : "Moeen Digital Trading Enterprise. All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-slate-900 px-2.5 py-1 rounded-md text-slate-450 border border-slate-800">
              {isAr ? "صنع بفخر في المملكة العربية السعودية 🇸🇦" : "Proudly Made in Saudi Arabia 🇸🇦"}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
