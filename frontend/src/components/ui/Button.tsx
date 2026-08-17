import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isLoading?: boolean
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/35 active:bg-brand-800',
  secondary:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 hover:border-brand-300 active:bg-brand-100',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold',
        'transition-all duration-200 ease-out active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
