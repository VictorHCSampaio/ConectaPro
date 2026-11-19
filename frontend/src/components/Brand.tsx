import { cn } from '@/lib/cn'

type BrandProps = {
  className?: string
  administrador?: boolean
}

export function Brand({ className, administrador = false }: BrandProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-baseline whitespace-nowrap font-semibold tracking-tight text-ink-900 dark:text-zinc-50',
        administrador
          ? 'text-[0.68rem] min-[400px]:text-[0.78rem] sm:text-[0.95rem]'
          : 'text-[0.95rem]',
        className,
      )}
    >
      {administrador ? (
        <>
          <span className="text-ocre-500 dark:text-ocre-400">ADMINISTRADOR</span>
          <span>-ConectaPro</span>
        </>
      ) : (
        'ConectaPro'
      )}
    </span>
  )
}
