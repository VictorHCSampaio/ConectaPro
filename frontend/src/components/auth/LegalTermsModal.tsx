import { AnimatePresence, motion } from 'framer-motion'
import { Scale, Shield, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export type LegalDocumentType = 'terms' | 'privacy'

type LegalTermsModalProps = {
  open: boolean
  onClose: () => void
  documentType: LegalDocumentType | null
}

const EASE = [0.16, 1, 0.3, 1] as const

const LEGAL_CONTENT: Record<
  LegalDocumentType,
  { title: string; subtitle: string; paragraphs: [string, string, string] }
> = {
  terms: {
    title: 'Termos de Uso',
    subtitle: 'Intermediação tecnológica',
    paragraphs: [
      'Os presentes Termos de Uso disciplinam o acesso e a utilização da plataforma ConectaPro, que atua exclusivamente como intermediador de tecnologia, disponibilizando infraestrutura digital para o encontro entre alunos e professores particulares. A ConectaPro não presta serviços educacionais, não ministra aulas e não elabora, revisa ou endossa o conteúdo pedagógico negociado entre as partes, limitando-se a oferecer o ambiente técnico necessário à captação, à divulgação de perfis e à aproximação dos usuários.',
      'O conteúdo, a metodologia, a qualidade, a pontualidade e os resultados das aulas particulares são de responsabilidade exclusiva do professor que as ministra e, no que couber, do aluno que as contrata. A ConectaPro fica isenta de qualquer responsabilidade direta ou indireta por danos, prejuízos, inadimplementos, divergências pedagógicas ou descumprimento de acordos celebrados entre os usuários, uma vez que não intervém na execução do serviço de ensino nem se torna parte da relação educacional.',
      'Ao criar conta e utilizar a plataforma, o usuário declara ter lido e aceito estes Termos, obrigando-se a fornecer dados verídicos, a empregar a ConectaPro apenas para fins lícitos e acadêmicos e a não praticar condutas que comprometam a segurança, a reputação ou o regular funcionamento do serviço. O descumprimento destas regras autoriza a suspensão ou o encerramento da conta, sem prejuízo das medidas legais cabíveis, permanecendo a ConectaPro adstrita, em qualquer hipótese, ao papel de intermediador tecnológico.',
    ],
  },
  privacy: {
    title: 'Política de Privacidade',
    subtitle: 'Lei nº 13.709/2018 — LGPD',
    paragraphs: [
      'Esta Política de Privacidade observa a Lei 13.709, de 14 de agosto de 2018, Lei Geral de Proteção de Dados Pessoais (LGPD). Os dados pessoais coletados no cadastro e no uso da ConectaPro, tais como nome, e-mail, perfil acadêmico e demais informações necessárias à intermediação, são tratados com base no consentimento do titular e na execução das funcionalidades da plataforma, em conformidade com os princípios da finalidade, adequação, necessidade e transparência.',
      'Os dados coletados destinam-se ao uso restrito da plataforma ConectaPro, exclusivamente para autenticação, operação da conexão entre alunos e professores, comunicação operacional e cumprimento de obrigações legais. Não comercializamos, alugamos ou cedemos dados pessoais a terceiros para fins publicitários. Eventuais compartilhamentos ocorrerão apenas quando indispensáveis à prestação do serviço, por determinação legal ou mediante consentimento específico do titular.',
      'Em conformidade com o artigo 18 da LGPD, o titular possui o direito de solicitar, a qualquer momento, a confirmação do tratamento, o acesso, a correção, a anonimização, a portabilidade e, em especial, a exclusão de seus dados pessoais. Para exercer esses direitos, o usuário pode requerer a exclusão da conta e dos dados associados pelos canais oficiais da plataforma. A solicitação será atendida no prazo legal, ressalvadas as hipóteses de conservação autorizadas por lei, como cumprimento de obrigação legal ou defesa em processo.',
    ],
  },
}

export function LegalTermsModal({ open, onClose, documentType }: LegalTermsModalProps) {
  const titleId = useId()
  const [activeType, setActiveType] = useState<LegalDocumentType>('terms')

  useEffect(() => {
    if (documentType) setActiveType(documentType)
  }, [documentType])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const content = LEGAL_CONTENT[activeType]
  const Icon = activeType === 'terms' ? Scale : Shield

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink-950/55 backdrop-blur-md dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: EASE }}
            className={cn(
              'relative flex max-h-[min(36rem,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg',
              'border border-paper-300/70 bg-paper-50/88 backdrop-blur-xl',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-20px_rgba(18,38,63,0.45)]',
              'dark:border-white/[0.08] dark:bg-night-800/72',
              'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.03),0_32px_64px_-16px_rgba(0,0,0,0.85)]',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-paper-200/80 px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
                    'border-paper-300/80 bg-white/70 text-ink-700',
                    'dark:border-white/10 dark:bg-white/[0.04] dark:text-ocre-400',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="label-mono text-paper-500 dark:text-zinc-500">{content.subtitle}</p>
                  <h2
                    id={titleId}
                    className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
                  >
                    {content.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-md',
                  'text-ink-500 transition-colors hover:bg-paper-200/80 hover:text-ink-900',
                  'dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500',
                )}
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="space-y-6 text-sm leading-7 text-ink-700 dark:text-zinc-300">
                {content.paragraphs.map((paragraph, index) => (
                  <p key={`${activeType}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>

            <footer className="border-t border-paper-200/80 px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <Button type="button" onClick={onClose}>
                Fechar
              </Button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
