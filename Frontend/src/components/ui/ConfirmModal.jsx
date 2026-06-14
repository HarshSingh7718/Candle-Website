import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  children
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] w-screen h-screen flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-[#D19D94]/10 text-[#D19D94]'}`}>
               <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer disabled:opacity-50">
            <X size={20} />
          </button>
        </div>
        
        <p className={`text-sm text-stone-600 ${children ? 'mb-4' : 'mb-6'}`}>{message}</p>
        
        {children && <div className="mb-6">{children}</div>}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-stone-900 hover:bg-stone-800 text-text-on-brand"
            }`}
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
