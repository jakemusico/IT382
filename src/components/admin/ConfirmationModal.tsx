'use client'

import { X, AlertCircle } from 'lucide-react'

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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200" 
        onClick={onCancel} 
      />
      
      {/* Bubble Effect Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-3xl mb-6 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
                  : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl font-bold text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
