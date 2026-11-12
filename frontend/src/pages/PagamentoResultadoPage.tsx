import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'

type Variante = 'sucesso' | 'falha' | 'pendente'

const config: Record<Variante, { icon: typeof CheckCircle; title: string; description: string; color: string; bg: string }> = {
  sucesso: {
    icon: CheckCircle,
    title: 'Pagamento confirmado!',
    description: 'Sua assinatura foi ativada com sucesso. Agora você pode configurar seu perfil e aparecer para os alunos.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-400/10',
  },
  falha: {
    icon: AlertTriangle,
    title: 'Pagamento recusado',
    description: 'Não foi possível processar seu pagamento. Verifique os dados e tente novamente.',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-400/10',
  },
  pendente: {
    icon: Clock,
    title: 'Pagamento pendente',
    description: 'Seu pagamento está sendo processado. Assim que for confirmado, sua conta será ativada automaticamente.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-400/10',
  },
}

export function PagamentoResultadoPage({ variante }: { variante: Variante }) {
  const navigate = useNavigate()
  const { icon: Icon, title, description, color, bg } = config[variante]

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center gap-6 rounded-lg border border-paper-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <div className={`flex size-16 items-center justify-center rounded-full ${bg}`}>
            <Icon className={`size-8 ${color}`} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-ink-600 dark:text-zinc-400">
              {description}
            </p>
          </div>

          {variante === 'sucesso' && (
            <Button onClick={() => navigate('/profile/edit')} className="w-full">
              Configurar meu perfil
            </Button>
          )}

          {variante === 'falha' && (
            <Button onClick={() => navigate('/pagamento')} className="w-full">
              Tentar novamente
            </Button>
          )}

          {variante === 'pendente' && (
            <Button onClick={() => navigate('/perfil')} variant="secondary" className="w-full">
              Ir para o início
            </Button>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
