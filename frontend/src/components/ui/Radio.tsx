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
    <div className="group flex items-center gap-2.5">
      <input
        id={inputId}
        type="radio"
        className={cn(
          'size-4 shrink-0 cursor-pointer border-paper-400 bg-paper-100 text-ink-800',
          'shadow-[inset_0_1px_2px_rgba(18,38,63,0.16)] transition-colors',
          'focus:ring-2 focus:ring-ocre-400/40 focus:ring-offset-0',
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="cursor-pointer text-sm text-ink-700 transition-colors group-hover:text-ink-900"
      >
        {label}
      </label>
    </div>
  )
}
