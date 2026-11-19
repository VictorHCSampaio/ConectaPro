import { ArrowLeft, CalendarDays, Flag, MapPin, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DenunciaDialog } from '@/components/denuncia/DenunciaDialog'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { FormSection } from '@/components/teacher-config/FormSection'
import { StarRating } from '@/components/ui/StarRating'
import { cn } from '@/lib/cn'
import { buscarPerfilAluno, type PerfilAluno } from '@/lib/usuarioService'
import { listarAvaliacoes, type Avaliacao } from '@/lib/avaliacaoService'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-paper-200/70 dark:bg-white/10', className)} />
  )
}

export function StudentPublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [denunciaAberta, setDenunciaAberta] = useState(false)
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    if (!id) return
    let active = true
    setIsLoading(true)
    setIsError(false)

    Promise.all([buscarPerfilAluno(id), listarAvaliacoes(id)])
      .then(([data, avs]) => {
        if (active) {
          setPerfil(data)
          setAvaliacoes(avs)
        }
      })
      .catch(() => {
        if (active) setIsError(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-50 dark:bg-night-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <Skeleton className="h-6 w-48" />
          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (isError || !perfil) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-50 dark:bg-night-900">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <p className="text-xl font-semibold text-ink-900 dark:text-white">
            Usuário não encontrado
          </p>
          <p className="text-sm text-ink-600 dark:text-zinc-400">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Link
            to="/aulas"
            className="mt-2 rounded-md border border-paper-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:border-paper-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            Voltar às aulas
          </Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const iniciais = (() => {
    const partes = perfil.nomeCompleto.trim().split(/\s+/)
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
  })()

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          to="/aulas"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-paper-500 transition-colors hover:text-ink-800 dark:text-zinc-500 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="size-4" />
          Voltar às aulas
        </Link>

        <div className="card rounded-xl p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {perfil.avatarUrl ? (
              <img
                src={perfil.avatarUrl}
                alt={perfil.nomeCompleto}
                className="size-20 shrink-0 rounded-full object-cover shadow-[0_4px_0_var(--color-ink-950)]"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-20 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xl font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_0_var(--color-ink-950)]"
              >
                {iniciais}
              </span>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-left">
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
                {perfil.nomeCompleto}
              </h1>
              <p className="text-sm text-ink-600 dark:text-zinc-400">{perfil.email}</p>

              {perfil.totalAvaliacoes > 0 && (
                <div className="mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <StarRating rating={perfil.rating} />
                  <span className="text-sm font-medium tabular-nums text-ink-900 dark:text-white">
                    {perfil.rating.toFixed(1).replace('.', ',')}
                  </span>
                  <span className="text-xs text-paper-500 dark:text-zinc-500">
                    ({perfil.totalAvaliacoes}{' '}
                    {perfil.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 bg-paper-100 px-3 py-1 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
                  <User className="size-3.5 text-paper-500 dark:text-zinc-500" />
                  Aluno
                </span>

                {perfil.cidade && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 bg-paper-100 px-3 py-1 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
                    <MapPin className="size-3.5 text-paper-500 dark:text-zinc-500" />
                    {perfil.bairro ? `${perfil.bairro}, ${perfil.cidade}` : perfil.cidade}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 bg-paper-100 px-3 py-1 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
                  <CalendarDays className="size-3.5 text-paper-500 dark:text-zinc-500" />
                  Membro desde {formatDate(perfil.membroDesde)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {perfil.biografia && (
          <div className="mt-6">
            <FormSection title="Sobre" description="Um pouco sobre este aluno.">
              <p className="whitespace-pre-line text-sm text-ink-700 dark:text-zinc-300">
                {perfil.biografia}
              </p>
            </FormSection>
          </div>
        )}

        <div className="mt-6">
          <FormSection title="Estatísticas" description="Atividade na plataforma.">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-paper-600 dark:text-zinc-400">Aulas confirmadas</span>
                <span className="font-semibold tabular-nums text-ink-900 dark:text-white">
                  {perfil.totalAulasAgendadas}
                </span>
              </div>
            </div>
          </FormSection>
        </div>

        {avaliacoes.length > 0 && (
          <div className="mt-6">
            <FormSection
              title="Avaliações"
              description={`${avaliacoes.length} ${avaliacoes.length === 1 ? 'avaliação recebida' : 'avaliações recebidas'}.`}
            >
              <ul className="flex flex-col gap-4">
                {avaliacoes.map((av) => (
                  <li
                    key={av.id}
                    className="flex flex-col gap-1 border-b border-paper-100 pb-4 last:border-0 last:pb-0 dark:border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <StarRating rating={av.nota} />
                      <span className="text-sm font-medium text-ink-900 dark:text-white">
                        {av.avaliadorNome}
                      </span>
                    </div>
                    {av.comentario && (
                      <p className="text-sm text-ink-600 dark:text-zinc-400">{av.comentario}</p>
                    )}
                    <span className="text-xs text-paper-500 dark:text-zinc-600">
                      {new Date(av.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            </FormSection>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setDenunciaAberta(true)}
            className="inline-flex items-center gap-1.5 text-xs text-paper-500 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
          >
            <Flag className="size-3.5" />
            Denunciar este usuário
          </button>
        </div>
      </main>

      <SiteFooter />

      {toast && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-medium shadow-lg',
            toast.variant === 'success'
              ? 'bg-sage-600 text-white'
              : 'bg-red-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}

      <DenunciaDialog
        open={denunciaAberta}
        onClose={() => setDenunciaAberta(false)}
        denunciadoId={perfil.id}
        denunciadoNome={perfil.nomeCompleto}
        onSuccess={() => {
          setDenunciaAberta(false)
          setToast({ variant: 'success', message: 'Denúncia registrada e enviada para análise' })
        }}
        onError={(msg) => setToast({ variant: 'error', message: msg })}
      />
    </div>
  )
}
