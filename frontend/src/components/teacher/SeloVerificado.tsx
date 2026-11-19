import { BadgeCheck } from 'lucide-react'

const TEXTO: Record<string, string> = {
  CERTIFICADO: 'Perfil verificado: Certificado avaliado e aprovado pela administração',
  ADMIN: 'Perfil verificado: Avaliado e aprovado em conversa com a administração',
}

type SeloVerificadoProps = {
  tipo?: string | null
}

export function SeloVerificado({ tipo }: SeloVerificadoProps) {
  const explicacao = (tipo && TEXTO[tipo]) || TEXTO.CERTIFICADO

  return (
    <span className="group relative inline-flex">
      <span className="inline-flex items-center gap-1 rounded-full border border-sage-600/20 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400">
        <BadgeCheck className="size-3.5" />
        Verificado
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-20 mt-1.5 hidden w-64 rounded-md border border-paper-200 bg-white px-3 py-2 text-xs leading-snug font-normal text-ink-800 shadow-lg group-hover:block dark:border-white/10 dark:bg-night-700 dark:text-zinc-100"
      >
        {explicacao}
      </span>
    </span>
  )
}
