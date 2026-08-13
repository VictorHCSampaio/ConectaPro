import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
  error?: string
}

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2.5">
        <input
          id={inputId}
          type="checkbox"
          className={cn(
            'mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600',
            'transition-colors focus:ring-2 focus:ring-brand-200 focus:ring-offset-0',
            className,
          )}
          {...props}
        />
        <label htmlFor={inputId} className="cursor-pointer text-sm leading-snug text-slate-600">
          {label}
        </label>
      </div>
      {error && <p className="animate-fade-in text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}
