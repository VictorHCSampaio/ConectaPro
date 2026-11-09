import { api, getAccessToken } from '@/lib/api'

export type DashboardResumo = {
  totalAlunos: number
  totalProfessores: number
}

export async function obterResumoDashboard(): Promise<DashboardResumo> {
  const token = getAccessToken()
  const { data } = await api.get<DashboardResumo>('/dashboard/resumo', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}
