import { cn } from '@/lib/cn'

type UserAvatarProps = {
  name?: string | null
  src?: string | null
  className?: string
}

function iniciais(nome?: string | null) {
  if (!nome) {
    return '?'
  }
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : ''
  return (primeira + ultima).toUpperCase() || '?'
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-800 font-semibold text-paper-50 dark:bg-white/10 dark:text-white',
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : iniciais(name)}
    </span>
  )
}
