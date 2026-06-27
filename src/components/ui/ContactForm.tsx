"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2 } from "lucide-react";

interface ContactFormProps {
  locale: string;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations("Landing");
  const isAr = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [association, setAssociation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !association.trim() || !message.trim()) {
      setError(isAr ? "يرجى ملء جميع الحقول المطلوبة بشكل صحيح." : "Please fill in all required fields correctly.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // محاكاة الإرسال التنفيذي لمدة 1.2 ثانية
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
      setName("");
      setEmail("");
      setAssociation("");
      setMessage("");
    } catch (err) {
      setError(isAr ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." : "An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center animate-fade-in max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {isAr ? "تم إرسال طلبك بنجاح!" : "Request Sent Successfully!"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isAr 
            ? "شكراً لتواصلك مع معين. سيتواصل معك أحد أعضاء الإدارة التنفيذية لمؤسسة معين الرقمية التجارية قريباً للتنسيق والنشر."
            : "Thank you for reaching out. A representative from the Executive Board of Moeen Digital Platform will contact you shortly."}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 px-6 py-2.5 text-xs font-bold text-teal-650 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
        >
          {isAr ? "إرسال رسالة جديدة" : "Send Another Message"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? "الاسم الكامل" : "Full Name"} <span className="text-rose-500">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "مثال: عبدالملك الحربي" : "e.g. Abdulmalik Al-Harbi"}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? "البريد الإلكتروني" : "Email Address"} <span className="text-rose-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? "مثال: name@domain.com" : "e.g. name@domain.com"}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-assoc" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAr ? "اسم الجمعية / الجهة" : "Charity / Organization Name"} <span className="text-rose-500">*</span>
          </label>
          <input
            id="contact-assoc"
            type="text"
            value={association}
            onChange={(e) => setAssociation(e.target.value)}
            placeholder={isAr ? "مثال: جمعية البر بالأجفر" : "e.g. Charity Association"}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-msg" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAr ? "تفاصيل طلب التحول أو الرسالة" : "Message Details"} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="contact-msg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isAr ? "اكتب هنا تفاصيل الاستفسار أو طلب الربط والتحول الرقمي..." : "Write details about your query or digital transformation request..."}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-5 py-3 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
            </>
          ) : (
            <>
              <Send size={14} className={isAr ? "rotate-180" : ""} />
              <span>{isAr ? "إرسال طلب التحول الرقمي" : "Submit Request"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
