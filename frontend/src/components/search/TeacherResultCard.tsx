import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'
import type { Teacher } from '@/types/teacher'

function formatModalities(modalities: Teacher['modalities']) {
  if (modalities.includes('online') && modalities.includes('presencial')) {
    return 'Online e presencial'
  }
  return modalities.includes('online') ? 'Online' : 'Presencial'
}

type TeacherResultCardProps = {
  teacher: Teacher
}

export function TeacherResultCard({ teacher }: TeacherResultCardProps) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow-brand sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white ring-4 ring-transparent transition-all duration-300 group-hover:ring-brand-100">
          {teacher.initials}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{teacher.name}</span>
            {teacher.verified && (
              <span className="flex items-center gap-1 rounded-full bg-growth-50 px-2 py-0.5 text-xs font-medium text-growth-700">
                <BadgeCheck className="size-3.5" />
                Verificado
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500">{teacher.subjects.join(' • ')}</p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <StarRating rating={teacher.rating} />
              <span className="text-sm font-medium text-slate-700">{teacher.rating}</span>
              <span className="text-sm text-slate-400">({teacher.reviewCount})</span>
            </div>

            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {formatModalities(teacher.modalities)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">R$ {teacher.pricePerHour}</p>
          <p className="text-xs text-slate-400">por hora-aula</p>
        </div>
        <Link
          to="/login"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
        >
          Ver perfil
        </Link>
      </div>
    </div>
  )
}
