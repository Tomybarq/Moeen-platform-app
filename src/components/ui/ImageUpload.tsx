"use client";

import React, { useState, useRef, DragEvent } from "react";
import { UploadCloud, Trash2, Image, Loader2, X } from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  type: "avatars" | "associations" | "beneficiaries" | "marketers";
  isAr: boolean;
}

export default function ImageUpload({ value, onChange, type, isAr }: ImageUploadProps) {
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // التحقق من الحجم
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        isAr
          ? "حجم الملف كبير جداً (الأقصى 5 ميجابايت)"
          : "File size is too large (maximum 5MB)",
        "error"
      );
      return;
    }

    // التحقق من النوع
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        isAr
          ? "صيغة الملف غير مدعومة (فقط JPG, PNG, WEBP)"
          : "Unsupported file format (only JPG, PNG, WEBP)",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isAr ? "فشل الرفع" : "Upload failed"));
      }

      onChange(data.filePath);
      showToast(
        isAr ? "تم رفع الصورة بنجاح" : "Image uploaded successfully",
        "success"
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(
        error.message || (isAr ? "فشل رفع الصورة" : "Failed to upload image"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {value ? (
        // عرض المعاينة عند وجود صورة مرفوعة
        <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <img
            src={value}
            alt="Upload Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* طبقة الخيارات عند التحويم */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "تغيير الصورة" : "Change Image"}
            >
              <Image size={18} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/35 text-rose-350 rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "حذف الصورة" : "Remove Image"}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        // منطقة الإسقاط والرفع عند عدم وجود صورة
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2.5 p-4 cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 dark:border-tertiary dark:bg-tertiary/5"
              : "border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-primary dark:text-tertiary animate-spin" size={32} />
              <span className="text-xs font-bold text-slate-450 dark:text-slate-400">
                {isAr ? "جاري الرفع..." : "Uploading..."}
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-450 dark:text-slate-550 transition-colors">
                <UploadCloud size={20} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-850 dark:text-white transition-colors">
                  {isAr ? "انقر أو اسحب صورة هنا للرفع" : "Click or drag image here to upload"}
                </p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">
                  {isAr ? "صيغ JPG, PNG, WEBP حتى 5 ميجابايت" : "JPG, PNG, WEBP up to 5MB"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={loading}
      />
    </div>
  );
}
