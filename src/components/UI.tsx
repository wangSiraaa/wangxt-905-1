import React from 'react'
import type { ClassificationLevel, BorrowStatus, UserRole } from '../types'
import { CLASSIFICATION_LABELS, BORROW_STATUS_LABELS, ROLE_LABELS } from '../constants/permissions'

export function ClassificationBadge({ level }: { level: ClassificationLevel }) {
  return (
    <span className={`classification-badge classification-${level}`}>
      {CLASSIFICATION_LABELS[level]}
    </span>
  )
}

export function StatusBadge({ status }: { status: BorrowStatus }) {
  const colorMap: Record<BorrowStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-gray-100 text-gray-700',
    borrowed: 'bg-green-100 text-green-800',
    returned: 'bg-slate-100 text-slate-700',
    overdue: 'bg-red-100 text-red-800'
  }
  return (
    <span className={`status-badge ${colorMap[status]}`}>
      {BORROW_STATUS_LABELS[status]}
    </span>
  )
}

export function RoleBadge({ role }: { role: UserRole }) {
  const colorMap: Record<UserRole, string> = {
    archivist: 'bg-purple-100 text-purple-800',
    borrower: 'bg-slate-100 text-slate-700',
    dept_manager: 'bg-indigo-100 text-indigo-800',
    auditor: 'bg-teal-100 text-teal-800'
  }
  return (
    <span className={`status-badge ${colorMap[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...rest
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  type?: 'button' | 'submit'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400'
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>
        {footer && <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">{footer}</div>}
      </div>
    </div>
  )
}

export function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}
