import { AnimatePresence, motion } from 'framer-motion'
import { Scale, Shield, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type UIEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export type LegalDocumentType = 'terms' | 'privacy'

type LegalTermsModalProps = {
  open: boolean
  onClose: () => void
  documentType: LegalDocumentType | null
  onReachEnd?: (type: LegalDocumentType) => void
}

const EASE = [0.16, 1, 0.3, 1] as const

type LegalSection = {
  heading: string
  paragraphs: string[]
}

const LEGAL_CONTENT: Record<
  LegalDocumentType,
  { title: string; subtitle: string; updatedAt: string; sections: LegalSection[] }
> = {
  terms: {
    title: 'Termos de Uso',
    subtitle: 'Intermediação tecnológica',
    updatedAt: 'Última atualização: 15 de novembro de 2026',
    sections: [
      {
        heading: '1. Sobre a plataforma',
        paragraphs: [
          'A ConectaPro é uma plataforma digital que conecta alunos a professores particulares, oferecendo busca por matéria e modalidade, perfis de professores, chat e agendamento de aulas. A ConectaPro atua exclusivamente como intermediadora de tecnologia: ela disponibiliza o ambiente para que alunos e professores se encontrem, mas não presta serviços educacionais, não ministra aulas e não elabora, revisa ou endossa o conteúdo pedagógico combinado entre as partes.',
          'Ao acessar e utilizar a plataforma, o usuário declara ter lido, compreendido e aceito estes Termos de Uso. Caso não concorde com qualquer ponto, o usuário deve deixar de utilizar a ConectaPro.',
        ],
      },
      {
        heading: '2. Cadastro e conta',
        paragraphs: [
          'Para usar a plataforma é necessário criar uma conta como aluno ou como professor, fornecendo dados verídicos e mantendo essas informações atualizadas. O usuário é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.',
          'A plataforma oferece verificação em duas etapas (2FA) como camada adicional de segurança. A conta de aluno é gratuita e fica ativa após o cadastro. A conta de professor passa por uma etapa de análise antes de ser liberada, conforme descrito a seguir.',
        ],
      },
      {
        heading: '3. Análise e aprovação do professor',
        paragraphs: [
          'Antes de aparecer nas buscas, a conta de professor é avaliada por um administrador. Nessa etapa, o envio de um certificado é obrigatório, pois comprova a formação ou a experiência do professor. Caso o professor não possua um certificado, ele pode informar essa condição e enviar uma justificativa, que será analisada da mesma forma.',
          'O administrador pode aprovar ou rejeitar o cadastro, sempre informando o motivo. Em caso de rejeição, o professor pode ajustar os dados e reenviar o cadastro para uma nova análise.',
        ],
      },
      {
        heading: '4. Assinatura e pagamento',
        paragraphs: [
          'A utilização da plataforma é gratuita para o aluno. O professor, após ter o cadastro aprovado, mantém uma assinatura para liberar a edição do perfil e passar a aparecer nas buscas. O pagamento da assinatura é processado por um provedor externo de pagamentos, e o perfil é liberado apenas após a confirmação.',
          'Eventuais valores, formas de cobrança e condições da assinatura são apresentados ao professor no momento da contratação.',
        ],
      },
      {
        heading: '5. Responsabilidades das partes',
        paragraphs: [
          'O conteúdo, a metodologia, a pontualidade, os valores e os resultados das aulas são de responsabilidade exclusiva do professor e do aluno envolvidos. A ConectaPro não participa da execução das aulas e fica isenta de responsabilidade por danos, inadimplementos, divergências pedagógicas ou descumprimento de acordos combinados entre as partes.',
          'As conversas realizadas pelo chat da plataforma, assim como qualquer comunicação externa combinada entre aluno e professor, devem seguir conduta ética e respeitosa.',
        ],
      },
      {
        heading: '6. Conduta do usuário',
        paragraphs: [
          'O usuário se compromete a não inserir dados falsos, a não utilizar a plataforma para fins ilícitos e a não praticar assédio, ofensas ou qualquer conduta inadequada com outros usuários. A plataforma disponibiliza um canal de denúncia para que condutas inadequadas sejam reportadas e analisadas pela administração.',
          'O descumprimento destes Termos autoriza a suspensão ou o encerramento imediato da conta, sem prejuízo das medidas legais cabíveis.',
        ],
      },
      {
        heading: '7. Alterações e vigência',
        paragraphs: [
          'A ConectaPro pode atualizar estes Termos de Uso a qualquer momento para refletir melhorias na plataforma ou exigências legais. A versão vigente fica sempre acessível dentro do sistema, e o uso contínuo da plataforma após uma atualização representa a concordância com a nova versão.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Política de Privacidade',
    subtitle: 'Lei nº 13.709/2018 (LGPD)',
    updatedAt: 'Última atualização: 15 de novembro de 2026',
    sections: [
      {
        heading: '1. Base legal',
        paragraphs: [
          'Esta Política de Privacidade observa a Lei nº 13.709/2018, a Lei Geral de Proteção de Dados Pessoais (LGPD). O tratamento dos dados ocorre com base no consentimento do titular e na necessidade de executar as funcionalidades da plataforma. Ao utilizar a ConectaPro, o usuário declara estar ciente das práticas descritas aqui.',
        ],
      },
      {
        heading: '2. Dados que coletamos',
        paragraphs: [
          'Para a criação da conta, coletamos nome completo e email. Para a estruturação do perfil do professor, coletamos telefone ou WhatsApp, biografia, informações didáticas (matérias, modelo de aula para particulares ou instituições, valor por hora e disponibilidade de horários) e dados de localização (CEP, logradouro, bairro, cidade e estado).',
          'O professor também pode enviar uma foto de perfil e um certificado que comprove sua formação ou experiência. Durante o uso da plataforma, tratamos ainda dados de interação, como mensagens trocadas no chat, notificações e eventuais denúncias registradas.',
        ],
      },
      {
        heading: '3. Como usamos os dados',
        paragraphs: [
          'A finalidade da coleta é operacional. Os dados didáticos e biográficos alimentam a busca e os filtros da plataforma. Os dados de localização são usados para calcular a proximidade e exibir professores disponíveis na região. O telefone ou WhatsApp viabiliza a conexão entre aluno e professor. O certificado e a eventual justificativa são usados apenas na análise do cadastro do professor.',
        ],
      },
      {
        heading: '4. Armazenamento e segurança',
        paragraphs: [
          'As senhas são armazenadas de forma protegida, e a plataforma oferece verificação em duas etapas. A foto de perfil do professor fica visível aos alunos, pois faz parte do perfil público. Já o certificado é armazenado em local restrito e fica acessível somente aos administradores durante a análise, por meio de um acesso temporário.',
        ],
      },
      {
        heading: '5. Compartilhamento',
        paragraphs: [
          'Não comercializamos, alugamos nem cedemos dados pessoais a terceiros para fins publicitários. O pagamento da assinatura do professor é processado por um provedor externo de pagamentos, que trata apenas os dados necessários para concluir a transação. Compartilhamentos adicionais ocorrem apenas por determinação legal ou com o consentimento específico do titular.',
        ],
      },
      {
        heading: '6. Direitos do titular',
        paragraphs: [
          'Em conformidade com o art. 18 da LGPD, o titular pode solicitar a confirmação da existência de tratamento, o acesso aos seus dados, a correção de informações incompletas ou desatualizadas e a exclusão dos dados, respeitadas as obrigações legais de guarda. As solicitações podem ser feitas pelos canais de contato disponíveis na plataforma.',
        ],
      },
      {
        heading: '7. Alterações',
        paragraphs: [
          'Esta Política pode ser atualizada para refletir melhorias na plataforma ou mudanças na legislação. A versão vigente fica sempre acessível dentro do sistema, com a data da última atualização indicada no topo do documento.',
        ],
      },
    ],
  },
}

export function LegalTermsModal({
  open,
  onClose,
  documentType,
  onReachEnd,
}: LegalTermsModalProps) {
  const titleId = useId()
  const [activeType, setActiveType] = useState<LegalDocumentType>('terms')
  const scrollRef = useRef<HTMLDivElement>(null)

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

  function aoRolar(evento: UIEvent<HTMLDivElement>) {
    const elemento = evento.currentTarget
    if (elemento.scrollTop + elemento.clientHeight >= elemento.scrollHeight - 8) {
      onReachEnd?.(activeType)
    }
  }

  useEffect(() => {
    if (!open) return
    const elemento = scrollRef.current
    if (!elemento) return
    const quadro = requestAnimationFrame(() => {
      if (elemento.scrollHeight <= elemento.clientHeight + 8) onReachEnd?.(activeType)
    })
    return () => cancelAnimationFrame(quadro)
  }, [open, activeType, onReachEnd])

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

            <div
              ref={scrollRef}
              onScroll={aoRolar}
              className="flex-1 overflow-y-auto px-5 py-6 sm:px-6"
            >
              <p className="mb-5 text-xs text-paper-500 dark:text-zinc-500">{content.updatedAt}</p>
              <div className="space-y-6 text-sm leading-7 text-ink-700 dark:text-zinc-300">
                {content.sections.map((section) => (
                  <section key={section.heading} className="space-y-2">
                    <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                      {section.heading}
                    </h3>
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.heading}-${index}`}>{paragraph}</p>
                    ))}
                  </section>
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
