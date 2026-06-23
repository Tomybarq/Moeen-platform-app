"use client";

import React, { useState, useRef } from "react";
import { User, Mail, Shield, ShieldCheck, Camera, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";

interface ProfileClientProps {
  initialUser: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    roleAr: string;
    roleType?: string;
    status: string;
    image: string | null;
  };
  isAr: boolean;
}

export default function ProfileClient({ initialUser, isAr }: ProfileClientProps) {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email);
  const [imagePreview, setImagePreview] = useState<string | null>(initialUser.image);
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        isAr
          ? "حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت"
          : "Image size is too large. Please select a file under 10MB"
      );
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality (makes it extremely small, 10-20KB)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setImagePreview(dataUrl);
          setNewImageBase64(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(isAr ? "الاسم الكامل مطلوب" : "Full name is required");
      return;
    }

    if (!email.trim()) {
      setErrorMsg(isAr ? "البريد الإلكتروني مطلوب" : "Email is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ...(newImageBase64 ? { imageBase64: newImageBase64 } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isAr ? "فشل تحديث الملف الشخصي" : "Failed to update profile"));
      }

      showToast(
        isAr ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!",
        "success"
      );

      // Refresh authentication context so headers update instantly
      await refreshUser();
      setNewImageBase64(null);
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred"));
      showToast(err.message || (isAr ? "حدث خطأ أثناء الحفظ" : "Error saving profile"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Avatar & info preview card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
        {/* Avatar Input */}
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#1E293B] shadow-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-transform duration-300 hover:scale-105">
            {imagePreview ? (
              <img src={imagePreview} alt={name || "User Avatar"} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="stroke-[1.5]" />
            )}
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-350">
            <Camera className="text-white" size={24} />
          </div>
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* User Name & Role badge */}
        <h2 className="text-base font-bold text-slate-850 dark:text-white mt-4 transition-colors">
          {name || (isAr ? "مستخدم جديد" : "New User")}
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">{email}</p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 dark:bg-tertiary/10 text-primary dark:text-tertiary border border-primary/10 dark:border-tertiary/20">
          <Shield size={12} />
          <span className="text-[10px] font-bold tracking-wide">
            {isAr ? initialUser.roleAr : initialUser.role}
          </span>
        </div>

        {/* Quick status details */}
        <div className="w-full border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-5 space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 dark:text-slate-500">
              {isAr ? "حالة الحساب" : "Account Status"}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-450">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {initialUser.status === "active" ? (isAr ? "نشط" : "Active") : initialUser.status}
            </span>
          </div>
          {/* <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 dark:text-slate-500">
              {isAr ? "معرف المستخدم" : "User ID"}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              #{initialUser.id}
            </span>
          </div> */}
        </div>
      </div>

      {/* Right side: Edit form card */}
      <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white">
            {isAr ? "تعديل الملف الشخصي" : "Edit Profile Info"}
          </h3>
          <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-1">
            {isAr
              ? "قم بتحديث معلومات الحساب والبريد الإلكتروني الخاص بك"
              : "Update your account details and email address"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-xl border border-rose-100 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isAr ? "الاسم الكامل" : "Full Name"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-slate-400 dark:text-slate-500">
                <User size={14} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl ps-10 pe-4 py-2.5 text-xs focus:ring-2 focus:ring-primary dark:focus:ring-tertiary outline-none text-slate-900 dark:text-white transition-all font-semibold"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isAr ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-slate-400 dark:text-slate-500">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl ps-10 pe-4 py-2.5 text-xs focus:ring-2 focus:ring-primary dark:focus:ring-tertiary outline-none text-slate-900 dark:text-white transition-all font-semibold"
              />
            </div>
          </div>

          {/* Readonly details */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                {isAr ? "رتبة الصلاحية" : "User Role"}
              </label>
              <div className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-xl px-3.5 py-3 text-xs text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>{initialUser.role}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                {isAr ? "نوع الصلاحية العام" : "Role Group Type"}
              </label>
              <div className="flex items-center gap-2 w-full bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-xl px-3.5 py-3 text-xs text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed">
                <Shield size={14} className="text-slate-400" />
                <span className="capitalize">{initialUser.roleType || "User"}</span>
              </div>
            </div>
          </div> */}

          {/* Form Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:opacity-95 rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {isAr ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
