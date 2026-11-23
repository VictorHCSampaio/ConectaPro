import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type PaginacaoProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
  disabled?: boolean
}

export function Paginacao({ page, totalPages, onChange, disabled }: PaginacaoProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="secondary"
        fullWidth={false}
        icon={<ChevronLeft className="size-4" />}
        disabled={disabled || page <= 0}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </Button>

      <span className="text-sm text-paper-500 dark:text-zinc-400">
        Página {page + 1} de {totalPages}
      </span>

      <Button
        type="button"
        variant="secondary"
        fullWidth={false}
        icon={<ChevronRight className="size-4" />}
        disabled={disabled || page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  )
}
