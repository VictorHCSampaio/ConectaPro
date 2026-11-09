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
  diaSemana: string
  horario: string
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

export async function obterResumoDashboard(dias: number): Promise<DashboardResumo> {
  const token = getAccessToken()
  const { data } = await api.get<DashboardResumo>('/dashboard/resumo', {
    params: { dias },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}
