'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete Item",
  cancelText = "Cancel",
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-slide-up mx-3 mb-3 sm:mx-0 sm:mb-0">
        
        {/* Warning Icon & Title area */}
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 border border-red-100 mb-4 animate-bounce-subtle">
            <AlertTriangle className="h-6 w-6 text-red-650" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-950 tracking-tight font-sans">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-zinc-50 border-t border-zinc-150 p-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
