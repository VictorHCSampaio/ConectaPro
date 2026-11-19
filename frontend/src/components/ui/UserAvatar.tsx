import { useState } from 'react'
import { cn } from '@/lib/cn'

type UserAvatarProps = {
  name?: string | null
  src?: string | null
  className?: string
}

function fotoValida(src?: string | null): src is string {
  if (typeof src !== 'string') {
    return false
  }
  const valor = src.trim()
  return valor.length > 0 && valor !== 'null' && valor !== 'undefined'
}

function inicial(nome?: string | null) {
  const letra = nome?.trim().charAt(0)
  return letra ? letra.toUpperCase() : '?'
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  const foto = fotoValida(src) ? src.trim() : null
  const [fotoQuebrada, setFotoQuebrada] = useState<string | null>(null)
  const mostrarFoto = foto != null && fotoQuebrada !== foto

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-800 font-semibold text-paper-50 dark:bg-white/10 dark:text-white',
        className,
      )}
    >
      {mostrarFoto ? (
        <img
          src={foto}
          alt=""
          className="size-full object-cover"
          onError={() => setFotoQuebrada(foto)}
        />
      ) : (
        inicial(name)
      )}
    </span>
  )
}
