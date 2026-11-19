import { api, getAccessToken } from '@/lib/api'

export type PontoMensal = {
  mes: string
  alunos: number
  professores: number
}

export type ContagemDisciplina = {
  disciplina: string
  quantidade: number
}

export type AulaRecente = {
  professor: string
  aluno: string
  materia: string
  dataHoraInicio: string | null
  status: string
  criadoEm: string
}

export type AtividadeRecente = {
  nome: string
  acao: string
  quando: string
}

export type DashboardResumo = {
  totalAlunos: number
  totalProfessores: number
  aulasConfirmadasNoMes: number
  receitaAssinaturasMes: number
  novosUsuarios: PontoMensal[]
  professoresPorMateria: ContagemDisciplina[]
  ultimasAulas: AulaRecente[]
  atividadesRecentes: AtividadeRecente[]
}

const PERIODO_DESDE_O_INICIO = 0

const resumosEmCache = new Map<number, DashboardResumo>()

export function chavePeriodoDashboard(dias: number): number {
  if (dias <= 0) {
    return PERIODO_DESDE_O_INICIO
  }
  return dias
}

export function lerResumoDashboard(dias: number): DashboardResumo | null {
  return resumosEmCache.get(chavePeriodoDashboard(dias)) ?? null
}

export function gravarResumoDashboard(dias: number, resumo: DashboardResumo) {
  resumosEmCache.set(chavePeriodoDashboard(dias), resumo)
}

export function limparCacheDashboard() {
  resumosEmCache.clear()
}

export async function obterResumoDashboard(dias: number): Promise<DashboardResumo> {
  const token = getAccessToken()
  const { data } = await api.get<DashboardResumo>('/dashboard/resumo', {
    params: { dias },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}
