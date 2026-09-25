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
  primary: cn(
    'bg-ink-800 text-paper-50 hover:bg-ink-700',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950),0_10px_20px_-10px_rgba(18,38,63,0.7)]',
    'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_3px_0_#000,0_10px_20px_-10px_rgba(0,0,0,0.9)]',
    'active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]',
  ),
  secondary: cn(
    'border border-paper-300 bg-white text-ink-800 hover:border-paper-400',
    'dark:border-white/10 dark:bg-night-700 dark:text-zinc-100 dark:hover:border-white/20',
    'shadow-[inset_0_1px_0_#fff,0_3px_0_var(--color-paper-200),0_10px_18px_-12px_rgba(18,38,63,0.4)]',
    'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_0_rgba(0,0,0,0.7),0_10px_18px_-12px_rgba(0,0,0,0.85)]',
    'active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(18,38,63,0.16)]',
    'dark:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]',
  ),
  ghost: cn(
    'text-ink-600 hover:bg-paper-100 hover:text-ink-900 active:bg-paper-200',
    'dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white dark:active:bg-white/10',
  ),
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
        'inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold',
        'transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out',
        'disabled:pointer-events-none disabled:opacity-45',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ocre-500',
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
