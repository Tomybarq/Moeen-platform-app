"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Settings, Trash2, Archive } from "lucide-react";

interface AddButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function AddButton({ label, onClick, href, className = "" }: AddButtonProps) {
  const baseClasses =
    "flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer select-none shrink-0";

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        <Plus size={14} strokeWidth={2.5} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      <Plus size={14} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}

interface EditButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function EditButton({ label, onClick, href, className = "" }: EditButtonProps) {
  const baseClasses =
    "flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:opacity-90 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer select-none shrink-0";

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`} title={label || "Edit"}>
        <Pencil size={12} strokeWidth={2.5} />
        {label && <span>{label}</span>}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`} title={label || "Edit"}>
      <Pencil size={12} strokeWidth={2.5} />
      {label && <span>{label}</span>}
    </button>
  );
}

interface BulkActionMenuProps {
  selectedIds: (number | string)[];
  onAction: (action: "delete" | "archive") => void;
  labels?: {
    delete?: string;
    archive?: string;
    settings?: string;
  };
  className?: string;
  showDelete?: boolean;
  showArchive?: boolean;
}

export function BulkActionMenu({
  selectedIds,
  onAction,
  labels,
  className = "",
  showDelete = true,
  showArchive = true,
}: BulkActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const show = selectedIds.length > 0 && (showDelete || showArchive);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show) return null;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-start ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 transition-all cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm animate-in zoom-in-95 duration-150"
        title={labels?.settings || "Actions"}
      >
        <Settings size={16} className="transition-transform duration-300 hover:rotate-45" />
      </button>

      {isOpen && (
        <div className="absolute start-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          {showArchive && (
            <button
              onClick={() => {
                onAction("archive");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white text-start transition-colors cursor-pointer"
            >
              <Archive size={14} className="text-slate-400" />
              <span>{labels?.archive || "Archive"}</span>
            </button>
          )}

          {showDelete && (
            <button
              onClick={() => {
                onAction("delete");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 text-start transition-colors cursor-pointer"
            >
              <Trash2 size={14} className="text-rose-400" />
              <span>{labels?.delete || "Delete"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
