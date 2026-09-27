import { BadgeCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'
import { formatDistance, formatModalities, formatRating } from '@/lib/formatTeacher'
import type { Teacher } from '@/types/teacher'

type TeacherResultCardProps = {
  teacher: Teacher
}

export function TeacherResultCard({ teacher }: TeacherResultCardProps) {
  const location =
    teacher.distanceKm == null ? teacher.city : `${formatDistance(teacher.distanceKm)} de você`

  return (
    <article className="card flex flex-col gap-4 rounded-lg p-5 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)] dark:hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-ink-800 text-sm font-semibold text-paper-50 raised-ink">
          {teacher.initials}
        </span>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink-900 dark:text-white">{teacher.name}</h3>
            {teacher.verified && (
              <span className="flex items-center gap-1 rounded-full border border-sage-600/20 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400">
                <BadgeCheck className="size-3.5" />
                Verificado
              </span>
            )}
          </div>

          <p className="text-sm text-ink-600 dark:text-zinc-400">{teacher.subjects.join(' · ')}</p>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-paper-600 dark:text-zinc-400">
            {teacher.reviewCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <StarRating rating={teacher.rating} />
                <span className="tnum">
                  {formatRating(teacher.rating)} · {teacher.reviewCount}{' '}
                  {teacher.reviewCount === 1 ? 'avaliação' : 'avaliações'}
                </span>
              </span>
            ) : (
              <span className="text-paper-500 dark:text-zinc-500">Ainda sem avaliações</span>
            )}
            <span className="hidden text-paper-300 dark:text-zinc-700 sm:inline">|</span>
            <span>{formatModalities(teacher.modalities)}</span>
            {location && (
              <>
                <span className="hidden text-paper-300 dark:text-zinc-700 sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {location}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-paper-100 pt-4 dark:border-white/[0.08] sm:shrink-0 sm:flex-col sm:items-end sm:gap-2.5 sm:border-t-0 sm:pt-0">
        <p className="text-right">
          <span className="tnum text-xl font-semibold text-ink-900 dark:text-white">
            R$ {teacher.pricePerHour}
          </span>
          <span className="label-mono block text-paper-500 dark:text-zinc-500">por hora</span>
        </p>
        <Link
          to={`/professores/${teacher.id}`}
          className="rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 raised transition-all duration-150 hover:border-paper-400 active:translate-y-0.5 active:shadow-[inset_0_2px_3px_rgba(18,38,63,0.16)] dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
