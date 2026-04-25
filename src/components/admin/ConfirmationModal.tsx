'use client'

import { X, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-blue-900/10 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onCancel} 
      />
      
      {/* Bubble Effect Modal */}
      <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-sm rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5 p-10 animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500 overflow-hidden">
        {/* Subtle top highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={clsx(
            "p-5 rounded-[2rem] mb-8 shadow-inner relative group",
            isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
          )}>
            <AlertCircle className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full blur-[2px] opacity-50" />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight italic">{title}</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed mb-10">
            {message}
          </p>
          
          <div className="flex flex-col w-full gap-4">
            <button
              onClick={onConfirm}
              className={clsx(
                "w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl relative group overflow-hidden",
                isDestructive 
                  ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700' 
                  : 'bg-gray-900 text-white shadow-gray-200 hover:bg-black'
              )}
            >
              <span className="relative z-10">{confirmText}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
            <button
              onClick={onCancel}
              className="w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-600 rounded-full transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
