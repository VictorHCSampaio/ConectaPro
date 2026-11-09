import { api } from '@/lib/api'
import type { Agendamento, AvailableSlot } from '@/types/agendamento'

export async function listarHorariosDisponiveis(professorId: string): Promise<AvailableSlot[]> {
  const { data } = await api.get<AvailableSlot[]>(`/agendamentos/disponiveis/${professorId}`)
  return data
}

export async function agendarAula(
  professorId: string,
  day: string,
  time: string,
  modality: string,
  subject: string,
): Promise<Agendamento> {
  const { data } = await api.post<Agendamento>('/agendamentos', {
    professorId,
    day,
    time,
    modality,
    subject,
  })
  return data
}

export async function listarMeusAgendamentos(): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>('/agendamentos/me')
  return data
}

export async function listarAgendamentosRecebidos(): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>('/agendamentos/recebidos')
  return data
}

export async function aprovarAgendamento(id: string): Promise<Agendamento> {
  const { data } = await api.post<Agendamento>(`/agendamentos/${id}/aprovar`)
  return data
}

export async function recusarAgendamento(id: string): Promise<Agendamento> {
  const { data } = await api.post<Agendamento>(`/agendamentos/${id}/recusar`)
  return data
}
