import { BadgeCheck, Clock, Loader2, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { MOCK_TEACHERS } from '@/lib/mockTeachers'
import { formatModalities, formatRating } from '@/lib/formatTeacher'
import type { Teacher } from '@/types/teacher'

export function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setIsError(false)
    setTeacher(null)

    const timer = setTimeout(() => {
      const found = MOCK_TEACHERS.find((t) => t.id === id) ?? null
      if (found) {
        setTeacher(found)
      } else {
        setIsError(true)
      }
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-50">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-paper-400" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (isError || !teacher) {
    return (
      <div className="flex min-h-screen flex-col bg-paper-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <p className="text-xl font-semibold text-ink-900">Professor não encontrado</p>
          <p className="text-sm text-ink-600">
            O perfil que você está procurando não existe ou foi removido.
          </p>
          <Link
            to="/professores"
            className="mt-2 rounded-md border border-paper-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] transition-[border-color,transform,box-shadow] duration-150 hover:border-paper-400 active:translate-y-0.5"
          >
            Ver todos os professores
          </Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-6 md:col-span-2">
            <div className="card rounded-xl p-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-ink-800 text-2xl font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_0_var(--color-ink-950)]">
                  {teacher.initials}
                </span>

                <div className="flex flex-col items-center gap-2.5 sm:items-start">
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                    <h1 className="text-2xl font-semibold text-ink-900">{teacher.name}</h1>
                    {teacher.verified && (
                      <span className="flex items-center gap-1 rounded-full border border-sage-600/20 bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600">
                        <BadgeCheck className="size-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating rating={teacher.rating} />
                    <span className="tnum text-sm font-semibold text-ink-900">
                      {formatRating(teacher.rating)}
                    </span>
                    <span className="text-sm text-paper-400">·</span>
                    <span className="text-sm text-paper-600">
                      {teacher.reviewCount} avaliações
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-sm text-paper-600">
                    <Monitor className="size-3.5" />
                    {formatModalities(teacher.modalities)}
                  </span>
                </div>
              </div>
            </div>

            {teacher.bio && (
              <section className="card rounded-xl p-6">
                <h2 className="mb-4 text-base font-semibold text-ink-900">Sobre mim</h2>
                <div className="flex flex-col gap-3">
                  {teacher.bio.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-ink-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            <section className="card rounded-xl p-6">
              <h2 className="mb-4 text-base font-semibold text-ink-900">Matérias</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full border border-paper-200 bg-paper-100 px-3.5 py-1 text-sm font-medium text-ink-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </section>

            {(teacher.weekDays || teacher.availability) && (
              <section className="card rounded-xl p-6">
                <h2 className="mb-4 text-base font-semibold text-ink-900">Disponibilidade</h2>
                {teacher.weekDays && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {teacher.weekDays.map((day) => (
                      <span
                        key={day}
                        className="flex h-9 w-11 items-center justify-center rounded-md border border-paper-200 bg-white text-sm font-semibold text-ink-800"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                )}
                {teacher.availability && (
                  <div className="flex flex-col gap-2.5">
                    {teacher.availability.map((slot) => (
                      <div key={slot} className="flex items-center gap-2 text-sm text-ink-700">
                        <Clock className="size-3.5 shrink-0 text-paper-500" />
                        {slot}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="card sticky top-24 rounded-xl p-6">
              <div className="mb-5 border-b border-paper-100 pb-5">
                <p className="label-mono text-paper-500">hora-aula a partir de</p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="tnum text-3xl font-semibold text-ink-900">
                    R$ {teacher.pricePerHour}
                  </span>
                  <span className="text-sm text-paper-500">/h</span>
                </p>
              </div>

              {teacher.availability && (
                <div className="mb-6 flex flex-col gap-2">
                  <p className="mb-1 text-sm font-medium text-ink-800">Turnos disponíveis</p>
                  {teacher.availability.map((slot) => (
                    <div key={slot} className="flex items-center gap-2 text-sm text-ink-700">
                      <Clock className="size-3.5 shrink-0 text-paper-400" />
                      {slot}
                    </div>
                  ))}
                </div>
              )}

              <Button variant="primary" fullWidth>
                Agendar aula
              </Button>

              <p className="mt-3 text-center text-xs text-paper-500">
                Sem cobrança antecipada — combine direto com o professor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
