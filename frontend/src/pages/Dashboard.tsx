import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  GraduationCap,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTheme } from '@/contexts/ThemeContext'
import { obterResumoDashboard } from '@/lib/dashboardService'
import type { AtividadeRecente, AulaRecente, DashboardResumo } from '@/lib/dashboardService'

type Metric = {
  label: string
  value: string
  icon: LucideIcon
}

const PERIODOS = [
  { dias: 7, label: 'Últimos 7 dias' },
  { dias: 30, label: 'Últimos 30 dias' },
  { dias: 90, label: 'Últimos 90 dias' },
]

const RESUMO_VAZIO: DashboardResumo = {
  totalAlunos: 0,
  totalProfessores: 0,
  aulasConfirmadasNoMes: 0,
  receitaAssinaturasMes: 0,
  novosUsuarios: [],
  professoresPorMateria: [],
  ultimasAulas: [],
  atividadesRecentes: [],
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  Confirmado: 'success',
  Solicitado: 'warning',
  Cancelado: 'destructive',
}

const AXIS_TICK = { fontSize: 12 }

const CONTROL_CLASS =
  'inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/5'

function formatCount(value: number) {
  return value.toLocaleString('pt-BR')
}

function formatMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function truncarDisciplina(nome: string) {
  if (nome.length <= 12) return nome
  return `${nome.slice(0, 12)}...`
}

function formatQuando(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatDataHorario(aula: AulaRecente) {
  const agenda = [aula.diaSemana, aula.horario].filter(Boolean).join(' · ')
  const quando = formatQuando(aula.criadoEm)
  if (agenda && quando) return `${agenda} · ${quando}`
  return agenda || quando || '—'
}

function iconeDaAtividade(acao: string): LucideIcon {
  const texto = acao.toLowerCase()
  if (texto.includes('cadastrou') || texto.includes('se cadastrou')) return UserPlus
  if (texto.includes('cancel')) return CalendarX
  if (texto.includes('agendamento') || texto.includes('aula')) return CalendarCheck
  if (texto.includes('matéria') || texto.includes('materia')) return BookOpen
  if (texto.includes('professor')) return GraduationCap
  return Clock
}

type ResumoEstado = 'loading' | 'ready' | 'error'

export function Dashboard() {
  const { theme } = useTheme()
  const painelRef = useRef<HTMLDivElement>(null)
  const exportando = useRef(false)
  const [dias, setDias] = useState(30)
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [resumoEstado, setResumoEstado] = useState<ResumoEstado>('loading')
  const isDark = theme === 'dark'
  const dados = resumo ?? RESUMO_VAZIO

  useEffect(() => {
    let ativo = true
    setResumoEstado('loading')

    obterResumoDashboard(dias)
      .then((data) => {
        if (!ativo) return
        setResumo(data)
        setResumoEstado('ready')
      })
      .catch(() => {
        if (!ativo) return
        setResumoEstado('error')
      })

    return () => {
      ativo = false
    }
  }, [dias])

  async function handleExportPDF() {
    const painel = painelRef.current
    if (!painel || exportando.current) return
    exportando.current = true
    try {
      const fundo = getComputedStyle(painel).backgroundColor
      const canvas = await html2canvas(painel, {
        scale: 2,
        backgroundColor: fundo || (isDark ? '#09090b' : '#fafafa'),
        useCORS: true,
        logging: false,
      })
      const imagem = canvas.toDataURL('image/png')
      const largura = canvas.width * 0.264583
      const altura = canvas.height * 0.264583
      const pdf = new jsPDF({
        orientation: largura > altura ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [largura, altura],
      })
      pdf.addImage(imagem, 'PNG', 0, 0, largura, altura)
      pdf.save('dashboard-conectapro.pdf')
    } finally {
      exportando.current = false
    }
  }

  const valor = (numero: number) => (resumoEstado === 'loading' ? '…' : formatCount(numero))

  const metrics: Metric[] = [
    { label: 'Alunos Ativos', value: valor(dados.totalAlunos), icon: GraduationCap },
    { label: 'Professores Ativos', value: valor(dados.totalProfessores), icon: Users },
    {
      label: 'Aulas Confirmadas',
      value: valor(dados.aulasConfirmadasNoMes),
      icon: BookOpen,
    },
    {
      label: 'Receita',
      value: resumoEstado === 'loading' ? '…' : formatMoeda(dados.receitaAssinaturasMes),
      icon: DollarSign,
    },
  ]

  const tick = isDark ? '#a1a1aa' : '#71717a'
  const grid = isDark ? 'rgba(255,255,255,0.08)' : '#e4e4e7'
  const primary = isDark ? '#fafafa' : '#18181b'
  const secondary = isDark ? '#71717a' : '#a1a1aa'
  const cursor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(24,24,27,0.04)'

  const tooltipStyle: CSSProperties = {
    background: isDark ? '#09090b' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7'}`,
    borderRadius: 8,
    boxShadow: 'none',
    fontSize: 12,
    color: primary,
  }

  return (
    <div
      ref={painelRef}
      className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Visão geral da plataforma
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="relative inline-flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-zinc-500" aria-hidden />
                  <span className="mt-[2px] leading-none">
                    {PERIODOS.find((opcao) => opcao.dias === dias)?.label}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-zinc-500" aria-hidden />
                <select
                  aria-label="Período"
                  value={dias}
                  onChange={(event) => setDias(Number(event.target.value))}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {PERIODOS.map((opcao) => (
                    <option key={opcao.dias} value={opcao.dias}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" className={CONTROL_CLASS} onClick={handleExportPDF}>
                <Download className="size-4" aria-hidden />
                Exportar
              </button>
            </div>
          </div>
        </header>

        {resumoEstado === 'error' && (
          <p className="mb-4 text-sm text-red-500" role="status">
            Não foi possível carregar o dashboard.
          </p>
        )}

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy={resumoEstado === 'loading'}
        >
          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Card key={metric.label}>
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="tnum text-3xl">{metric.value}</CardTitle>
                  <CardAction>
                    <span className="flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                  </CardAction>
                </CardHeader>
              </Card>
            )
          })}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Professores por Disciplina</CardTitle>
              <CardDescription>
                Professores que entraram nos últimos {dias} dias, por disciplina
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {dados.professoresPorMateria.length === 0 ? (
                <p className="flex h-full items-center text-sm text-zinc-500">
                  Nenhuma disciplina com professor vinculado.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dados.professoresPorMateria}
                    margin={{ top: 8, right: 4, left: -12, bottom: 16 }}
                  >
                    <CartesianGrid vertical={false} stroke={grid} />
                    <XAxis
                      dataKey="disciplina"
                      interval={0}
                      tickFormatter={truncarDisciplina}
                      tick={{ ...AXIS_TICK, fill: tick }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ ...AXIS_TICK, fill: tick }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: cursor }}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: primary, fontWeight: 600 }}
                    />
                    <Bar
                      dataKey="quantidade"
                      name="Professores"
                      fill={primary}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Novos Usuários</CardTitle>
              <CardDescription>Cadastros nos últimos {dias} dias</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {dados.novosUsuarios.length === 0 ? (
                <p className="flex h-full items-center text-sm text-zinc-500">
                  Sem histórico de cadastros no período.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dados.novosUsuarios}
                    margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke={grid} />
                    <XAxis
                      dataKey="mes"
                      minTickGap={24}
                      tick={{ ...AXIS_TICK, fill: tick }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ ...AXIS_TICK, fill: tick }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: grid }}
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: primary, fontWeight: 600 }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, color: tick }}
                    />
                    <Line
                      type="monotone"
                      dataKey="alunos"
                      name="Alunos"
                      stroke={primary}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: primary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="professores"
                      name="Professores"
                      stroke={secondary}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: secondary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="min-w-0 gap-4 lg:col-span-2">
            <CardHeader>
              <CardTitle>Últimas Aulas Agendadas</CardTitle>
              <CardDescription>Agendamentos mais recentes na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Professor</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Matéria</TableHead>
                    <TableHead>Data/Horário</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.ultimasAulas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="pl-6 text-zinc-500">
                        Nenhum agendamento registrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados.ultimasAulas.map((aula) => (
                      <TableRow key={`${aula.professor}-${aula.aluno}-${aula.criadoEm}`}>
                        <TableCell className="pl-6 font-medium">{aula.professor}</TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-300">
                          {aula.aluno}
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-300">
                          {aula.materia}
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-300">
                          {formatDataHorario(aula)}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Badge variant={STATUS_VARIANT[aula.status] ?? 'secondary'}>
                            {aula.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-4 lg:col-span-1">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimos eventos da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {dados.atividadesRecentes.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhuma atividade recente.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {dados.atividadesRecentes.map((item: AtividadeRecente) => {
                    const Icon = iconeDaAtividade(item.acao)

                    return (
                      <li key={`${item.nome}-${item.quando}-${item.acao}`} className="flex gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-300">
                            <span className="font-medium text-zinc-950 dark:text-zinc-50">
                              {item.nome}
                            </span>{' '}
                            {item.acao}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {formatQuando(item.quando)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
