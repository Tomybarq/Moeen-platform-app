"use client";

import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-505 mb-4 shadow-inner">
        {icon || <FolderOpen size={28} />}
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-slate-550 dark:text-slate-400 max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
