export type AvailableSlot = {
  day: string
  time: string
  available: boolean
}

export type AgendamentoStatus = 'SOLICITADO' | 'CONFIRMADO' | 'CANCELADO'

export type Agendamento = {
  id: string
  professorId: string
  professorName: string
  studentName: string
  day: string
  time: string
  modality: string
  subject: string
  status: AgendamentoStatus
  createdAt: string
  alunoUsuarioId: string
  professorUsuarioId: string
}
