import { BadgeCheck, FileText } from 'lucide-react'
import { useState } from 'react'
import { SeloVerificado } from '@/components/teacher/SeloVerificado'
import { extractErrorMessage } from '@/lib/api'
import { obterCertificadoPublico } from '@/lib/certificadoService'

type CartaoCertificadoProps = {
  professorId: string
  nome?: string | null
  verificado?: boolean
  tipoVerificacao?: string | null
}

export function CartaoCertificado({
  professorId,
  nome,
  verificado = false,
  tipoVerificacao,
}: CartaoCertificadoProps) {
  const [erro, setErro] = useState<string | null>(null)
  const [abrindo, setAbrindo] = useState(false)

  async function verCertificado() {
    setErro(null)
    setAbrindo(true)
    try {
      const certificado = await obterCertificadoPublico(professorId)
      window.open(certificado.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setErro(extractErrorMessage(error, 'Não foi possível abrir o certificado.'))
    } finally {
      setAbrindo(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-paper-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink-900 dark:text-white">
          Certificado / Diploma Profissional
        </p>
        {verificado && <SeloVerificado tipo={tipoVerificacao} />}
      </div>
      <p className="inline-flex items-center gap-2 text-sm text-ink-700 dark:text-zinc-300">
        <FileText className="size-4 text-sage-600 dark:text-emerald-400" />
        {nome || 'Certificado enviado'}
        {verificado && (
          <span className="inline-flex items-center gap-1 text-xs text-sage-600 dark:text-emerald-400">
            <BadgeCheck className="size-3.5" />
            Aprovado
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={verCertificado}
        disabled={abrindo}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-paper-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:border-paper-400 disabled:opacity-50 dark:border-white/10 dark:bg-night-700 dark:text-zinc-100"
      >
        <FileText className="size-3.5" />
        {abrindo ? 'Abrindo…' : 'Ver certificado'}
      </button>
      {erro && <p className="text-xs font-medium text-alert-600 dark:text-alert-200">{erro}</p>}
    </div>
  )
}
