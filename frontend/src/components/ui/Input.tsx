import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
}

export function Input({ label, error, icon, trailing, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full rounded-xl border bg-white py-3 text-sm text-slate-900 placeholder:text-slate-400',
            'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0',
            icon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-11' : 'pr-4',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="animate-fade-in text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
