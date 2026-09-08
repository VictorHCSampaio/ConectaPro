import { BadgeCheck, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'

const FEATURED_TEACHER = {
  initials: 'AL',
  name: 'Ana Lima',
  subjects: 'Matemática • Física',
  rating: 4.9,
  reviewCount: 128,
  pricePerHour: 60,
}

export function TeacherPreviewCard() {
  return (
    <div className="animate-pop-in group relative w-full max-w-sm">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-300/40 to-growth-300/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="shadow-glow-brand hover:shadow-glow-brand-lg rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[0.5deg]">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white ring-4 ring-brand-100 transition-all duration-300 group-hover:ring-brand-200">
            {FEATURED_TEACHER.initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">{FEATURED_TEACHER.name}</span>
              <BadgeCheck className="size-4 text-brand-600" />
            </div>
            <p className="text-sm text-slate-500">{FEATURED_TEACHER.subjects}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <StarRating rating={FEATURED_TEACHER.rating} />
          <span className="text-sm font-medium text-slate-700">{FEATURED_TEACHER.rating}</span>
          <span className="text-sm text-slate-400">
            ({FEATURED_TEACHER.reviewCount} avaliações)
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
          <Video className="size-4" />
          Aulas online e presenciais
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-400">A partir de</p>
            <p className="text-xl font-bold text-slate-900">
              R$ {FEATURED_TEACHER.pricePerHour}
              <span className="text-sm font-medium text-slate-400">/hora</span>
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="mt-4 block rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg"
        >
          Ver perfil completo
        </Link>
      </div>
    </div>
  )
}
