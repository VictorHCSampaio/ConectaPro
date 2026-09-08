import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isLoading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-glow-brand hover:shadow-glow-brand-lg hover:-translate-y-0.5 hover:from-brand-500 hover:to-brand-600 active:translate-y-0',
  secondary:
    'bg-white text-brand-700 border border-brand-200 shadow-sm hover:bg-brand-50 hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  fullWidth = true,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold',
        'transition-all duration-200 ease-out active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        fullWidth && 'w-full',
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
