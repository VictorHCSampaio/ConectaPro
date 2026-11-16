import { Loader2, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { FormSection } from '@/components/teacher-config/FormSection'
import { Button } from '@/components/ui/Button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useAuth } from '@/hooks/useAuth'
import { ehContaAdmin } from '@/types/auth'
import { chaveUsuarioCache, gravarPerfilProfessor, lerPerfilProfessor } from '@/lib/perfilCache'
import { buscarPerfilProfessor } from '@/lib/teacherProfileService'
import { StudentProfilePage } from '@/pages/StudentProfilePage'
import type { TeacherProfilePayload } from '@/types/teacher-profile'

const MODALIDADES: Record<string, string> = {
  ONLINE: 'Online',
  PRESENCIAL: 'Presencial',
}

const MODELOS: Record<string, string> = {
  PARTICULARES: 'Aulas particulares',
  INSTITUICOES: 'Instituições',
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label-mono text-xs text-paper-500 dark:text-zinc-500">{rotulo}</span>
      <span className="text-sm text-ink-900 dark:text-white">{valor}</span>
    </div>
  )
}

function TeacherProfileView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const chave = chaveUsuarioCache()
  const cacheInicial = lerPerfilProfessor(chave)

  const [perfil, setPerfil] = useState<TeacherProfilePayload | null>(cacheInicial)
  const [isLoading, setIsLoading] = useState(cacheInicial == null)
  const ehAdmin = ehContaAdmin(user)

  useEffect(() => {
    let isActive = true

    buscarPerfilProfessor()
      .then((dados) => {
        if (!isActive || !dados) {
          return
        }
        gravarPerfilProfessor(chave, dados)
        setPerfil(dados)
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [chave])

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-mono text-paper-600 dark:text-zinc-500">Conta</p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
                Meu perfil
              </h1>
              <UserAvatar
                name={perfil?.fullName ?? user?.name}
                src={perfil?.avatarUrl ?? user?.avatarUrl}
                className="size-16 border border-paper-300 text-base dark:border-white/15"
              />
            </div>
            {ehAdmin && (
              <span className="mt-3 inline-flex w-fit items-center rounded-full border border-ocre-400/40 bg-ocre-50 px-2.5 py-1 text-xs font-semibold text-ocre-700 dark:bg-ocre-400/10 dark:text-ocre-300">
                Administrador
              </span>
            )}
            <p className="mt-2 text-sm text-ink-600 dark:text-zinc-400">
              {user?.name} · {user?.email}
            </p>
          </div>
          <Button
            variant="secondary"
            fullWidth={false}
            icon={<Pencil className="size-4" />}
            onClick={() => navigate('/profile/edit')}
            className="shrink-0"
          >
            Editar perfil
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
            <Loader2 className="size-4 animate-spin" />
            Carregando…
          </div>
        ) : !perfil ? (
          <div className="mt-8 rounded-md border border-paper-200 bg-paper-50 p-6 text-sm text-ink-600 dark:border-white/10 dark:bg-night-800 dark:text-zinc-400">
            Você ainda não configurou seu perfil. Clique em{' '}
            <span className="font-medium text-ink-900 dark:text-white">Editar perfil</span> para
            começar.
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            <FormSection
              title="Sobre"
              description={
                ehAdmin ? 'Informações da conta administrativa.' : 'Como os alunos veem você.'
              }
            >
              <div className="flex flex-col gap-4">
                <Campo rotulo="Nome" valor={perfil.fullName} />
                <Campo rotulo="Telefone" valor={perfil.phone || '—'} />
                <div className="flex flex-col gap-1">
                  <span className="label-mono text-xs text-paper-500 dark:text-zinc-500">
                    Biografia
                  </span>
                  <p className="text-sm leading-relaxed text-ink-800 dark:text-zinc-200">
                    {perfil.bio || '—'}
                  </p>
                </div>
              </div>
            </FormSection>

            {!ehAdmin && (
            <FormSection title="Ensino" description="O que, como e por quanto você ensina.">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <Campo
                    rotulo="Modalidade"
                    valor={
                      perfil.modalities && perfil.modalities.length > 0
                        ? perfil.modalities.map((m) => MODALIDADES[m] ?? m).join(' e ')
                        : '—'
                    }
                  />
                  <Campo
                    rotulo="Modelo"
                    valor={perfil.teachingModel ? (MODELOS[perfil.teachingModel] ?? '—') : '—'}
                  />
                  <Campo rotulo="Hora-aula" valor={`R$ ${perfil.pricePerHour}`} />
                  <Campo rotulo="Matérias" valor={String(perfil.subjects.length)} />
                </div>

                {perfil.subjects.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="label-mono text-xs text-paper-500 dark:text-zinc-500">
                      Disciplinas
                    </span>
                    <ul className="flex flex-col gap-2">
                      {perfil.subjects.map((materia) => (
                        <li
                          key={materia.id}
                          className="flex items-center justify-between rounded-md border border-paper-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-night-700"
                        >
                          <span className="font-medium text-ink-900 dark:text-white">
                            {materia.name}
                          </span>
                          <span className="text-xs text-paper-500 dark:text-zinc-500">
                            {materia.level}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </FormSection>
            )}

            {!ehAdmin && perfil.advanceNoticeHours != null && perfil.advanceNoticeHours > 0 && (
              <FormSection
                title="Agendamento"
                description="Configurações de como os alunos agendam com você."
              >
                <Campo
                  rotulo="Antecedência mínima"
                  valor={`${perfil.advanceNoticeHours} hora(s)`}
                />
              </FormSection>
            )}

            <FormSection title="Localização" description="Visível apenas para você.">
              <div className="grid grid-cols-2 gap-4">
                <Campo rotulo="Cidade" valor={perfil.address.city || '—'} />
                <Campo rotulo="Bairro" valor={perfil.address.neighborhood || '—'} />
              </div>
            </FormSection>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

export function ProfileViewPage() {
  const { user } = useAuth()
  const ehAdmin = ehContaAdmin(user)
  const ehProfessor = user?.role === 'PROFESSOR' && !ehAdmin

  if (
    ehProfessor &&
    (user?.statusConta === 'EM_ANALISE' || user?.statusConta === 'REJEITADO')
  ) {
    return <Navigate to="/cadastro-status" replace />
  }

  if (ehProfessor && user?.statusConta === 'PENDENTE_PAGAMENTO') {
    return <Navigate to="/pagamento" replace />
  }

  return ehAdmin || ehProfessor ? <TeacherProfileView /> : <StudentProfilePage />
}
