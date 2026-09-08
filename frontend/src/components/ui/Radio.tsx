import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
}

export function Radio({ label, id, className, ...props }: RadioProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex items-center gap-2.5">
      <input
        id={inputId}
        type="radio"
        className={cn(
          'size-4 shrink-0 cursor-pointer border-slate-300 text-brand-600',
          'transition-colors focus:ring-2 focus:ring-brand-200 focus:ring-offset-0',
          className,
        )}
        {...props}
      />
      <label htmlFor={inputId} className="cursor-pointer text-sm text-slate-600">
        {label}
      </label>
    </div>
  )
}
