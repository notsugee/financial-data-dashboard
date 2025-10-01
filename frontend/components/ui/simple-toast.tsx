"use client"

import * as React from "react"
import { useEffect, useState } from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
  duration?: number
  onClose?: () => void
}

interface ToastState {
  id: string
  title?: string
  description?: string
  variant: "default" | "success" | "error"
  duration: number
  onClose?: () => void
}

type ToastContextType = {
  toasts: ToastState[]
  showToast: (props: ToastProps) => void
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const showToast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: ToastState = {
      id,
      title: props.title,
      description: props.description,
      variant: props.variant || "default",
      duration: props.duration || 5000,
      onClose: props.onClose,
    }
    
    setToasts((prev) => [...prev, toast])
    
    setTimeout(() => {
      dismissToast(id)
    }, toast.duration)
    
    return id
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id)
      if (toast?.onClose) {
        toast.onClose()
      }
      return prev.filter((t) => t.id !== id)
    })
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toast: context.showToast,
    dismiss: context.dismissToast,
  }
}

function ToastContainer() {
  const context = React.useContext(ToastContext)
  if (!context) return null
  
  const { toasts, dismissToast } = context

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2 sm:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex w-full flex-col gap-1 rounded-md border p-4 shadow-lg animate-in slide-in-from-right-full ${
            toast.variant === "success"
              ? "border-green-500 bg-green-50 text-green-800"
              : toast.variant === "error"
              ? "border-red-500 bg-red-50 text-red-800"
              : "border-gray-200 bg-white text-gray-800"
          }`}
        >
          <div className="flex items-center justify-between">
            {toast.title && (
              <h3 className="text-sm font-semibold">{toast.title}</h3>
            )}
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}