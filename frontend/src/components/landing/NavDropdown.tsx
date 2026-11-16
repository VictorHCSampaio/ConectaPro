import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type NavDropdownProps = {
  label: string
  trigger: ReactNode
  triggerClassName?: string
  align?: 'left' | 'right'
  children: (close: () => void) => ReactNode
}

export function NavDropdown({
  label,
  trigger,
  triggerClassName,
  align = 'right',
  children,
}: NavDropdownProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const painelId = useId()

  useEffect(() => {
    if (!aberto) return

    function fecharAoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false)
      }
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEscape)
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEscape)
    }
  }, [aberto])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((atual) => !atual)}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {aberto && (
        <div
          id={painelId}
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-2 min-w-52 overflow-hidden rounded-lg border border-paper-200 bg-paper-50 py-1 shadow-[0_16px_40px_-24px_rgba(18,38,63,0.7)] dark:border-white/10 dark:bg-night-800',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  )
}
