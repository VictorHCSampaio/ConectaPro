import type { AgendamentoStatus } from '@/types/agendamento'

export const DAY_ORDER = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

const DAY_LABELS: Record<string, string> = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
  dom: 'Domingo',
}

const SHIFT_LABELS: Record<string, string> = {
  matutino: 'Matutino',
  vespertino: 'Vespertino',
  noturno: 'Noturno',
}

export function formatSlotDay(day: string) {
  return DAY_LABELS[day] ?? day
}

export function formatSlotTime(time: string) {
  return SHIFT_LABELS[time] ?? time
}

const MODALITY_LABELS: Record<string, string> = {
  ONLINE: 'Online',
  PRESENCIAL: 'Presencial',
}

export function formatModality(modality: string) {
  return MODALITY_LABELS[modality?.toUpperCase()] ?? modality
}

export const AGENDAMENTO_STATUS_LABEL: Record<AgendamentoStatus, string> = {
  SOLICITADO: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Recusado',
}

export function formatDataHoraInicio(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' às ' + d.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })
}
