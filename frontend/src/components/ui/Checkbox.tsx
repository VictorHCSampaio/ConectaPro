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
      <div className="group flex items-start gap-2.5">
        <input
          id={inputId}
          type="checkbox"
          className={cn(
            'mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm border-paper-400 bg-paper-100 text-ink-800',
            'shadow-[inset_0_1px_2px_rgba(18,38,63,0.16)] transition-colors',
            'focus:ring-2 focus:ring-ocre-400/40 focus:ring-offset-0',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer text-sm leading-snug text-ink-700 transition-colors group-hover:text-ink-900"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-xs font-medium text-alert-600">{error}</p>}
    </div>
  )
}
