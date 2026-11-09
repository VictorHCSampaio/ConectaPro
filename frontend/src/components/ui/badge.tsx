import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant =
  'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'destructive'

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
  secondary: 'border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  outline: 'border-zinc-200 text-zinc-700 dark:border-white/10 dark:text-zinc-200',
  success: 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'border-transparent bg-sky-500/10 text-sky-600 dark:text-sky-400',
  destructive: 'border-transparent bg-red-500/10 text-red-600 dark:text-red-400',
}

function Badge({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        BADGE_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
export type { BadgeVariant }
