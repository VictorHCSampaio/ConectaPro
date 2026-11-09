import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  ChevronDown,
  Clock,
  Download,
  GraduationCap,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { StarRating } from '@/components/ui/StarRating'
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
import type { DashboardResumo } from '@/lib/dashboardService'
import { cn } from '@/lib/cn'

type Metric = {
  label: string
  value: string
  icon: LucideIcon
  trend: string
  positive: boolean
}

type AulaStatus = 'Confirmada' | 'Em andamento' | 'Concluída' | 'Pendente' | 'Cancelada'

type AulaAgendada = {
  professor: string
  disciplina: string
  avaliacao: number
  status: AulaStatus
}

type Atividade = {
  name: string
  action: string
  time: string
  icon: LucideIcon
}

const PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias']

const mockAlunosAtivos = 1250
const mockProfessoresCadastrados = 320
const mockAulasRealizadas = 854
const mockHorasDeAula = '1.200h'

const mockAulasPorDisciplina = [
  { disciplina: 'Matemática', aulas: 248 },
  { disciplina: 'Física', aulas: 176 },
  { disciplina: 'Inglês', aulas: 214 },
  { disciplina: 'Programação', aulas: 216 },
]

const mockNovosUsuarios = [
  { mes: 'Jun', alunos: 86, professores: 18 },
  { mes: 'Jul', alunos: 104, professores: 21 },
  { mes: 'Ago', alunos: 97, professores: 16 },
  { mes: 'Set', alunos: 128, professores: 24 },
  { mes: 'Out', alunos: 143, professores: 19 },
  { mes: 'Nov', alunos: 161, professores: 27 },
]

const mockUltimasAulas: AulaAgendada[] = [
  { professor: 'Ana Beatriz Lima', disciplina: 'Matemática', avaliacao: 4.9, status: 'Confirmada' },
  {
    professor: 'Carlos Eduardo Mendes',
    disciplina: 'Física',
    avaliacao: 4.6,
    status: 'Em andamento',
  },
  { professor: 'Juliana Costa', disciplina: 'Inglês', avaliacao: 5, status: 'Concluída' },
  { professor: 'Ricardo Alves', disciplina: 'Programação', avaliacao: 4.7, status: 'Pendente' },
  { professor: 'Fernanda Rocha', disciplina: 'Química', avaliacao: 4.2, status: 'Cancelada' },
  {
    professor: 'Pedro Henrique Souza',
    disciplina: 'Matemática',
    avaliacao: 4.8,
    status: 'Confirmada',
  },
]

const STATUS_VARIANT: Record<AulaStatus, BadgeVariant> = {
  Confirmada: 'success',
  'Em andamento': 'info',
  Concluída: 'secondary',
  Pendente: 'warning',
  Cancelada: 'destructive',
}

const mockAtividades: Atividade[] = [
  { name: 'João', action: 'agendou uma aula de Física', time: 'há 5 min', icon: CalendarCheck },
  { name: 'Maria', action: 'se cadastrou como aluna', time: 'há 18 min', icon: UserPlus },
  {
    name: 'Camila',
    action: 'avaliou a aula de Inglês com 5 estrelas',
    time: 'há 40 min',
    icon: Star,
  },
  { name: 'Lucas', action: 'cancelou a aula de Química', time: 'há 1 h', icon: CalendarX },
  { name: 'Juliana Costa', action: 'publicou novos horários', time: 'há 2 h', icon: Clock },
  {
    name: 'Pedro',
    action: 'concluiu o cadastro de professor',
    time: 'há 3 h',
    icon: GraduationCap,
  },
]

const AXIS_TICK = { fontSize: 12 }

const CONTROL_CLASS =
  'inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/5'

function formatCount(value: number) {
  return value.toLocaleString('pt-BR')
}

function formatRating(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

type ResumoEstado = 'loading' | 'ready' | 'error'

export function Dashboard() {
  const { theme } = useTheme()
  const [period, setPeriod] = useState(PERIODS[1])
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [resumoEstado, setResumoEstado] = useState<ResumoEstado>('loading')
  const isDark = theme === 'dark'

  useEffect(() => {
    let ativo = true

    obterResumoDashboard()
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
  }, [])

  const alunosAtivos =
    resumoEstado === 'loading' ? '…' : formatCount(resumo?.totalAlunos ?? mockAlunosAtivos)
  const professoresCadastrados =
    resumoEstado === 'loading'
      ? '…'
      : formatCount(resumo?.totalProfessores ?? mockProfessoresCadastrados)

  const metrics: Metric[] = [
    {
      label: 'Alunos Ativos',
      value: alunosAtivos,
      icon: GraduationCap,
      trend: '+12% em relação ao mês passado',
      positive: true,
    },
    {
      label: 'Professores Cadastrados',
      value: professoresCadastrados,
      icon: Users,
      trend: '+4% em relação ao mês passado',
      positive: true,
    },
    {
      label: 'Aulas Realizadas no Mês',
      value: formatCount(mockAulasRealizadas),
      icon: BookOpen,
      trend: '-3% em relação ao mês passado',
      positive: false,
    },
    {
      label: 'Horas de Aula',
      value: mockHorasDeAula,
      icon: Clock,
      trend: '+8% em relação ao mês passado',
      positive: true,
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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
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
              <label className="relative">
                <CalendarDays
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <select
                  aria-label="Período"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className={cn(CONTROL_CLASS, 'appearance-none pr-8 pl-9')}
                >
                  {PERIODS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
              </label>

              <button type="button" className={CONTROL_CLASS}>
                <Download className="size-4" aria-hidden />
                Exportar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={CONTROL_CLASS}>
              <Plus className="size-4" aria-hidden />
              Novo Professor
            </button>
            <button type="button" className={CONTROL_CLASS}>
              <Plus className="size-4" aria-hidden />
              Nova Disciplina
            </button>
          </div>
        </header>

        {resumoEstado === 'error' && (
          <p className="mb-4 text-sm text-red-500" role="status">
            Não foi possível carregar os totais. Exibindo valores de referência para alunos e
            professores.
          </p>
        )}

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy={resumoEstado === 'loading'}
        >
          {metrics.map((metric) => {
            const Icon = metric.icon
            const TrendIcon = metric.positive ? TrendingUp : TrendingDown

            return (
              <Card key={metric.label} className="gap-4">
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="tnum text-3xl">{metric.value}</CardTitle>
                  <CardAction>
                    <span className="flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      'flex items-start gap-1 text-xs font-medium leading-4',
                      metric.positive ? 'text-emerald-500' : 'text-red-500',
                    )}
                  >
                    <TrendIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {metric.trend}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Aulas por Disciplina</CardTitle>
              <CardDescription>Volume de aulas realizadas neste mês</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockAulasPorDisciplina}
                  margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis
                    dataKey="disciplina"
                    tick={{ ...AXIS_TICK, fill: tick }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ ...AXIS_TICK, fill: tick }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: cursor }}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: primary, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="aulas"
                    name="Aulas"
                    fill={primary}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Novos Usuários</CardTitle>
              <CardDescription>Alunos e professores nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockNovosUsuarios}
                  margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis
                    dataKey="mes"
                    tick={{ ...AXIS_TICK, fill: tick }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ ...AXIS_TICK, fill: tick }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
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
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="min-w-0 gap-4 lg:col-span-2">
            <CardHeader>
              <CardTitle>Últimas Aulas Agendadas</CardTitle>
              <CardDescription>Aulas mais recentes na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Professor</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUltimasAulas.map((aula) => (
                    <TableRow key={`${aula.professor}-${aula.disciplina}`}>
                      <TableCell className="pl-6 font-medium">{aula.professor}</TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-300">
                        {aula.disciplina}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StarRating rating={aula.avaliacao} />
                          <span className="tnum text-xs text-zinc-500">
                            {formatRating(aula.avaliacao)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Badge variant={STATUS_VARIANT[aula.status]}>{aula.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <ul className="flex flex-col gap-4">
                {mockAtividades.map((item) => {
                  const Icon = item.icon

                  return (
                    <li key={`${item.name}-${item.time}`} className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-300">
                          <span className="font-medium text-zinc-950 dark:text-zinc-50">
                            {item.name}
                          </span>{' '}
                          {item.action}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{item.time}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
