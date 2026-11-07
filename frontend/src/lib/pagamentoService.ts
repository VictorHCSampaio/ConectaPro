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
