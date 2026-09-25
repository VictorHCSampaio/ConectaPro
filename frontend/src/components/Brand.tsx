import { cn } from '@/lib/cn'

type BrandProps = {
  className?: string
}

export function Brand({ className }: BrandProps) {
  return (
    <span
      className={cn(
        'text-[0.95rem] font-semibold tracking-tight text-ink-900 dark:text-zinc-50',
        className,
      )}
    >
      ConectaPro
    </span>
  )
}
