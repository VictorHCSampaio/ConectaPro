import { Loader2, Scale, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { FormFeedback } from '@/components/auth/FormFeedback'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { extractErrorMessage } from '@/lib/api'
import {
  MOTIVOS_DENUNCIA,
  TEXTO_RECOMENDACAO_BO,
  TIMEOUTS,
  aplicarTimeout,
  atualizarStatusDenuncia,
  banirUsuario,
  desbanirUsuario,
  listarDenuncias,
  recomendarBoletim,
} from '@/lib/denunciaService'
import type { DenunciaRegistro, PapelUsuario, StatusDenuncia } from '@/lib/denunciaService'

const STATUS_LABEL: Record<StatusDenuncia, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  RESOLVIDA: 'Resolvida',
  ARQUIVADA: 'Arquivada',
  ENCAMINHADA: 'Resolvida / Encaminhada às autoridades',
}

const STATUS_VARIANT: Record<StatusDenuncia, BadgeVariant> = {
  PENDENTE: 'warning',
  EM_ANALISE: 'info',
  RESOLVIDA: 'success',
  ARQUIVADA: 'secondary',
  ENCAMINHADA: 'success',
}

const ABAS: { id: 'TODAS' | PapelUsuario; label: string }[] = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'ALUNO', label: 'Alunos' },
  { id: 'PROFESSOR', label: 'Professores' },
]

type ModalAcao = 'ban' | 'unban' | 'timeout' | 'bo' | null

function rotuloMotivo(motivo: DenunciaRegistro['motivo']) {
  return MOTIVOS_DENUNCIA.find((item) => item.value === motivo)?.label ?? motivo
}

function rotuloPapel(papel?: PapelUsuario | null) {
  if (papel === 'ALUNO') return 'Aluno'
  if (papel === 'PROFESSOR') return 'Professor'
  return 'Perfil não informado'
}

function formatData(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function AdminDenunciaResolutionPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const papelQuery = searchParams.get('papel')
  const abaInicial: 'TODAS' | PapelUsuario =
    papelQuery === 'ALUNO' || papelQuery === 'PROFESSOR' ? papelQuery : 'TODAS'

  const [denuncias, setDenuncias] = useState<DenunciaRegistro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [aba, setAba] = useState(abaInicial)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<StatusDenuncia>('PENDENTE')
  const [notas, setNotas] = useState('')
  const [horas, setHoras] = useState<number>(24)
  const [motivoBan, setMotivoBan] = useState('')
  const [modal, setModal] = useState<ModalAcao>(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    let ativo = true
    listarDenuncias()
      .then((lista) => {
        if (ativo) setDenuncias(lista)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar as denúncias.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return denuncias.filter((denuncia) => {
      if (aba !== 'TODAS' && denuncia.denunciadoTipo !== aba) return false
      if (!termo) return true
      const motivo = rotuloMotivo(denuncia.motivo).toLowerCase()
      return [denuncia.denunciadoNome, denuncia.denunciante.nome, denuncia.descricao, motivo]
        .filter(Boolean)
        .some((valor) => valor!.toLowerCase().includes(termo))
    })
  }, [denuncias, aba, busca])

  const selecionada = denuncias.find((denuncia) => denuncia.id === id) ?? null

  useEffect(() => {
    setStatus(selecionada?.status ?? 'PENDENTE')
    setNotas(selecionada?.notasModeracao ?? '')
    setModal(null)
    setAcaoErro(null)
  }, [selecionada?.id, selecionada?.status, selecionada?.notasModeracao])

  function abrir(denunciaId: string) {
    const papel = aba === 'TODAS' ? '' : `?papel=${aba}`
    navigate(`/admin/denuncias/${denunciaId}${papel}`)
  }

  function substituir(atualizada: DenunciaRegistro) {
    setDenuncias((lista) => lista.map((item) => (item.id === atualizada.id ? atualizada : item)))
  }

  async function confirmarBan() {
    if (!selecionada || !motivoBan.trim()) return
    setProcessando(true)
    setAcaoErro(null)
    try {
      await banirUsuario(selecionada.denunciadoId, motivoBan.trim())
      setAviso('Utilizador banido. A sessão e os tokens ativos deixam de ser aceites.')
      setModal(null)
      setMotivoBan('')
    } catch (error) {
      setAcaoErro(extractErrorMessage(error, 'Não foi possível banir o utilizador.'))
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarUnban() {
    if (!selecionada) return
    setProcessando(true)
    setAcaoErro(null)
    try {
      await desbanirUsuario(selecionada.denunciadoId)
      setAviso('Utilizador desbanido. O acesso foi restaurado.')
      setModal(null)
    } catch (error) {
      setAcaoErro(extractErrorMessage(error, 'Não foi possível desbanir o utilizador.'))
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarTimeout() {
    if (!selecionada) return
    setProcessando(true)
    setAcaoErro(null)
    try {
      await aplicarTimeout(selecionada.denunciadoId, horas)
      setAviso('Timeout aplicado. O acesso fica bloqueado até o fim do prazo.')
      setModal(null)
    } catch (error) {
      setAcaoErro(extractErrorMessage(error, 'Não foi possível aplicar o timeout.'))
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarBo() {
    if (!selecionada) return
    setProcessando(true)
    setAcaoErro(null)
    try {
      const atualizada = await recomendarBoletim(selecionada.id)
      substituir(atualizada)
      setAviso('Recomendação enviada ao denunciante e caso marcado como encaminhado.')
      setModal(null)
    } catch (error) {
      setAcaoErro(extractErrorMessage(error, 'Não foi possível enviar a recomendação.'))
    } finally {
      setProcessando(false)
    }
  }

  async function salvarCaso() {
    if (!selecionada) return
    setProcessando(true)
    setAcaoErro(null)
    setAviso(null)
    try {
      const atualizada = await atualizarStatusDenuncia(selecionada.id, status, notas)
      substituir(atualizada)
      setAviso('Estado e notas de moderação registados.')
    } catch (error) {
      setAcaoErro(extractErrorMessage(error, 'Não foi possível atualizar a denúncia.'))
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 dark:bg-night-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="label-mono text-paper-600 dark:text-zinc-400">Administração</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            <Scale className="size-7 text-ocre-500" />
            Resolução de denúncias
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
            Ocorrências contra alunos e professores, com as ações de moderação no mesmo painel.
          </p>
          <Link
            to="/dashboard"
            className="mt-3 inline-flex text-sm font-medium text-ocre-600 hover:underline dark:text-ocre-300"
          >
            Voltar ao dashboard
          </Link>
        </div>

        {erro && <FormFeedback variant="error" message={erro} />}
        {acaoErro && (
          <div className="mb-4">
            <FormFeedback variant="error" message={acaoErro} />
          </div>
        )}
        {aviso && (
          <p className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {aviso}
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-lg border border-paper-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap gap-2">
              {ABAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={aba === item.id}
                  onClick={() => setAba(item.id)}
                  className={
                    aba === item.id
                      ? 'rounded-md bg-ink-800 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-night-900'
                      : 'rounded-md border border-paper-300 px-3 py-1.5 text-xs font-semibold text-ink-700 dark:border-white/10 dark:text-zinc-200'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-md border border-paper-300 bg-paper-50 px-3 py-2 dark:border-white/10 dark:bg-night-800">
              <Search className="size-4 text-zinc-500" aria-hidden />
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Pesquisar por nome, motivo ou descrição"
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
              />
            </label>

            <div className="mt-4 flex max-h-[36rem] flex-col gap-2 overflow-auto">
              {carregando && (
                <p className="inline-flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando denúncias…
                </p>
              )}
              {!carregando && filtradas.length === 0 && (
                <p className="text-sm text-zinc-500">Nenhuma denúncia neste filtro.</p>
              )}
              {filtradas.map((denuncia) => (
                <button
                  key={denuncia.id}
                  type="button"
                  onClick={() => abrir(denuncia.id)}
                  className={
                    denuncia.id === id
                      ? 'rounded-md border border-ocre-400 bg-ocre-50 px-3 py-3 text-left dark:border-ocre-500/40 dark:bg-ocre-500/10'
                      : 'rounded-md border border-paper-200 px-3 py-3 text-left hover:bg-paper-50 dark:border-white/10 dark:hover:bg-white/5'
                  }
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink-900 dark:text-white">
                      {denuncia.denunciadoNome || 'Usuário removido'}
                    </span>
                    <Badge variant={STATUS_VARIANT[denuncia.status]}>{STATUS_LABEL[denuncia.status]}</Badge>
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {rotuloPapel(denuncia.denunciadoTipo)} · {rotuloMotivo(denuncia.motivo)} ·{' '}
                    {formatData(denuncia.dataCriacao)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-paper-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            {!selecionada ? (
              <p className="text-sm text-zinc-500">
                Selecione uma denúncia para ver o relato e as ações administrativas.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ocre-600 dark:text-ocre-300">
                    <ShieldCheck className="size-3.5" />
                    {rotuloPapel(selecionada.denunciadoTipo)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink-900 dark:text-white">
                    {selecionada.denunciadoNome || 'Usuário removido'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
                    Autor: {selecionada.denunciante.nome}
                  </p>
                  <p className="mt-2 text-sm text-ink-800 dark:text-zinc-200">
                    {rotuloMotivo(selecionada.motivo)} · {formatData(selecionada.dataCriacao)}
                  </p>
                </div>

                <div className="rounded-md border border-paper-200 bg-paper-50 p-3 dark:border-white/10 dark:bg-night-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Descrição</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-900 dark:text-zinc-100">
                    {selecionada.descricao}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Ações administrativas</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModal('ban')}
                      className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      Banir utilizador
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal('unban')}
                      className="rounded-md border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                    >
                      Desbanir utilizador
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal('timeout')}
                      className="rounded-md border border-paper-300 px-3 py-2 text-xs font-semibold text-ink-800 dark:border-white/10 dark:text-zinc-100"
                    >
                      Aplicar timeout
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal('bo')}
                      className="rounded-md border border-paper-300 px-3 py-2 text-xs font-semibold text-ink-800 dark:border-white/10 dark:text-zinc-100"
                    >
                      Recomendar boletim de ocorrência
                    </button>
                  </div>

                  {modal === 'timeout' && (
                    <label className="flex flex-col gap-1 text-xs font-semibold text-ink-800 dark:text-zinc-100">
                      Duração
                      <select
                        value={horas}
                        onChange={(event) => setHoras(Number(event.target.value))}
                        className="rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-normal dark:border-white/10 dark:bg-night-800 dark:text-zinc-100"
                      >
                        {TIMEOUTS.map((item) => (
                          <option key={item.horas} value={item.horas}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-800 dark:text-zinc-100">
                  Alterar estado
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as StatusDenuncia)}
                    className="rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-normal dark:border-white/10 dark:bg-night-800 dark:text-zinc-100"
                  >
                    {(Object.keys(STATUS_LABEL) as StatusDenuncia[]).map((item) => (
                      <option key={item} value={item}>
                        {STATUS_LABEL[item]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-800 dark:text-zinc-100">
                  Notas de moderação
                  <textarea
                    value={notas}
                    onChange={(event) => setNotas(event.target.value)}
                    rows={4}
                    placeholder="Observações internas, visíveis só para a administração."
                    className="rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-normal text-ink-900 outline-none focus:border-ocre-400 dark:border-white/10 dark:bg-night-800 dark:text-zinc-100"
                  />
                </label>
                <div>
                  <button
                    type="button"
                    onClick={salvarCaso}
                    disabled={processando}
                    className="rounded-md bg-ink-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-night-900"
                  >
                    {processando ? 'A guardar…' : 'Guardar estado e notas'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />

      {modal === 'ban' && selecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ban-titulo"
            className="w-full max-w-md rounded-lg border border-paper-200 bg-white p-5 dark:border-white/10 dark:bg-night-800"
          >
            <h2 id="ban-titulo" className="text-lg font-semibold text-ink-900 dark:text-white">
              Banir utilizador
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-zinc-200">
              Banir permanentemente {selecionada.denunciadoNome || 'este utilizador'}? A conta fica
              inativa e os tokens JWT deixam de ser aceites.
            </p>
            <label className="mt-4 flex flex-col gap-1 text-xs font-semibold text-ink-800 dark:text-zinc-100">
              Motivo do banimento
              <textarea
                value={motivoBan}
                onChange={(event) => setMotivoBan(event.target.value)}
                rows={3}
                placeholder="Descreva o motivo do banimento. Será exibido ao utilizador ao tentar entrar."
                className="rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-normal text-ink-900 outline-none focus:border-red-400 dark:border-white/10 dark:bg-night-900 dark:text-zinc-100"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setModal(null); setMotivoBan('') }}
                disabled={processando}
                className="rounded-md border border-paper-300 px-3 py-2 text-sm dark:border-white/10 dark:text-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBan}
                disabled={processando || !motivoBan.trim()}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Confirmar banimento
              </button>
            </div>
          </div>
        </div>
      )}
      {modal === 'unban' && selecionada && (
        <Confirmacao
          titulo="Desbanir utilizador"
          texto={`Restaurar o acesso de ${selecionada.denunciadoNome || 'este utilizador'}? A conta voltará ao estado ativo.`}
          confirmarLabel="Confirmar desbanimento"
          processando={processando}
          onCancelar={() => setModal(null)}
          onConfirmar={confirmarUnban}
        />
      )}
      {modal === 'timeout' && selecionada && (
        <Confirmacao
          titulo="Aplicar timeout"
          texto={`Bloquear ${selecionada.denunciadoNome || 'este utilizador'} por ${TIMEOUTS.find((item) => item.horas === horas)?.label}?`}
          confirmarLabel="Aplicar timeout"
          processando={processando}
          onCancelar={() => setModal(null)}
          onConfirmar={confirmarTimeout}
        />
      )}
      {modal === 'bo' && (
        <Confirmacao
          titulo="Recomendar boletim de ocorrência"
          texto={TEXTO_RECOMENDACAO_BO}
          detalhe="Esta mensagem será enviada ao denunciante e o caso passará para Resolvida / Encaminhada às autoridades."
          confirmarLabel="Enviar recomendação"
          processando={processando}
          onCancelar={() => setModal(null)}
          onConfirmar={confirmarBo}
        />
      )}
    </div>
  )
}

function Confirmacao({
  titulo,
  texto,
  detalhe,
  confirmarLabel,
  perigo = false,
  processando,
  onCancelar,
  onConfirmar,
}: {
  titulo: string
  texto: string
  detalhe?: string
  confirmarLabel: string
  perigo?: boolean
  processando: boolean
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacao-titulo"
        className="w-full max-w-md rounded-lg border border-paper-200 bg-white p-5 dark:border-white/10 dark:bg-night-800"
      >
        <h2 id="confirmacao-titulo" className="text-lg font-semibold text-ink-900 dark:text-white">
          {titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-zinc-200">{texto}</p>
        {detalhe && <p className="mt-2 text-sm text-zinc-500">{detalhe}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={processando}
            className="rounded-md border border-paper-300 px-3 py-2 text-sm dark:border-white/10 dark:text-zinc-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={processando}
            className={
              perigo
                ? 'rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60'
                : 'rounded-md bg-ink-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-night-900'
            }
          >
            {confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
