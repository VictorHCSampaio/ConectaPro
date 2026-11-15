import { CircleAlert, CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/cn'

type ToastProps = {
  message: string
  variant?: 'success' | 'error'
  onDismiss: () => void
}

export function Toast({ message, variant = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4200)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss, variant])

  const ok = variant === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-20 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3.5 shadow-lg sm:right-6',
        ok
          ? 'border-sage-600/30 bg-sage-50 dark:bg-emerald-950/80'
          : 'border-red-600/25 bg-red-50 dark:border-red-400/20 dark:bg-red-950/80',
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sage-600 dark:text-emerald-400" />
      ) : (
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />
      )}
      <p
        className={cn(
          'text-sm font-medium',
          ok ? 'text-sage-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-200',
        )}
      >
        {message}
      </p>
    </div>
  )
}
