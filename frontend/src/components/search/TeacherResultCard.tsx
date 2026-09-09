import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'
import { formatModalities, formatRating } from '@/lib/formatTeacher'
import type { Teacher } from '@/types/teacher'

type TeacherResultCardProps = {
  teacher: Teacher
}

export function TeacherResultCard({ teacher }: TeacherResultCardProps) {
  return (
    <article className="card flex flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-ink-800 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_0_var(--color-ink-950)]">
            {teacher.initials}
          </span>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-ink-900">{teacher.name}</h3>
              {teacher.verified && (
                <span className="flex items-center gap-1 rounded-full border border-sage-600/20 bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600">
                  <BadgeCheck className="size-3.5" />
                  Verificado
                </span>
              )}
            </div>

            <p className="text-sm text-ink-600">{teacher.subjects.join(' · ')}</p>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-paper-600">
              <span className="flex items-center gap-1.5">
                <StarRating rating={teacher.rating} />
                <span className="tnum">
                  {formatRating(teacher.rating)} · {teacher.reviewCount} avaliações
                </span>
              </span>
              <span className="hidden text-paper-300 sm:inline">|</span>
              <span>{formatModalities(teacher.modalities)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-paper-100 pt-4 sm:shrink-0 sm:flex-col sm:items-end sm:gap-2.5 sm:border-t-0 sm:pt-0">
          <p className="text-right">
            <span className="tnum text-xl font-semibold text-ink-900">
              R$ {teacher.pricePerHour}
            </span>
            <span className="label-mono block text-paper-500">por hora</span>
          </p>
          <Link
            to="/login"
            className="rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] transition-[border-color,transform,box-shadow] duration-150 hover:border-paper-400 active:translate-y-0.5 active:shadow-[inset_0_2px_3px_rgba(18,38,63,0.16)]"
          >
            Ver perfil
          </Link>
        </div>
    </article>
  )
}
