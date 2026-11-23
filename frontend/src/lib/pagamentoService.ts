import { api } from '@/lib/api'

type CheckoutResponse = {
  preferenceId: string
  redirectUrl: string
}

type StatusPagamentoResponse = {
  status: string
}

export async function criarCheckout() {
  const { data } = await api.post<CheckoutResponse>('/pagamentos/checkout')
  return data
}

export async function obterStatusPagamento() {
  const { data } = await api.get<StatusPagamentoResponse>('/pagamentos/status')
  return data
}

export async function solicitarReembolso() {
  const { data } = await api.post<{ message: string }>('/pagamentos/reembolso')
  return data
}
