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
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="label-mono text-paper-600">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-paper-500">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'inset-well w-full rounded-md py-3 text-sm text-ink-900 placeholder:text-paper-400',
            'transition-[border-color,box-shadow] duration-200 focus:outline-none',
            icon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-alert-600/50 focus:border-alert-600'
              : 'hover:border-paper-400 focus:border-ocre-400 focus:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)]',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-2 z-10 flex items-center">{trailing}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-alert-600">
          {error}
        </p>
      )}
    </div>
  )
}
