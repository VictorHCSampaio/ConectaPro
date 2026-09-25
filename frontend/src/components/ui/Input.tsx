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
      <label htmlFor={inputId} className="label-mono text-paper-600 dark:text-zinc-500">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-paper-500 dark:text-zinc-600">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'inset-well w-full rounded-md py-3 text-sm text-ink-900 placeholder:text-paper-400',
            'transition-all duration-200 focus:outline-none',
            'dark:border-white/10 dark:text-white dark:placeholder:text-zinc-600',
            icon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-alert-600/50 focus:border-alert-600'
              : 'hover:border-paper-400 focus:border-ocre-400 focus:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)] dark:hover:border-white/20 dark:focus:border-ocre-500 dark:focus:shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_0_0_3px_rgba(192,161,74,0.25)]',
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
