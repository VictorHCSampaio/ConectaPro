import { BadgeCheck, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'
import { formatRating } from '@/lib/formatTeacher'
import { MOCK_TEACHERS } from '@/lib/mockTeachers'

const FEATURED = MOCK_TEACHERS.slice(0, 3)

export function FeaturedPanel() {
  return (
    <div className="relative w-full">
      <div className="card-lifted overflow-hidden rounded-lg transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-2xl dark:[box-shadow:0_0_0_1px_rgba(255,255,255,0.06),0_32px_64px_-16px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-paper-200 bg-paper-50 px-5 py-3 transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.04]">
          <span className="label-mono text-paper-600 dark:text-zinc-500">Em destaque</span>
          <span className="label-mono text-paper-500 dark:text-zinc-600">Hoje</span>
        </div>

        <ul>
          {FEATURED.map((teacher) => (
            <li
              key={teacher.id}
              className="flex items-center gap-3.5 border-b border-paper-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-paper-50 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-ink-800 text-xs font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_0_var(--color-ink-950)]">
                {teacher.initials}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{teacher.name}</p>
                <p className="truncate text-xs text-paper-600 dark:text-zinc-400">{teacher.subjects.join(' · ')}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRating rating={teacher.rating} />
                  <span className="tnum text-xs text-paper-600 dark:text-zinc-400">
                    {formatRating(teacher.rating)} ({teacher.reviewCount})
                  </span>
                </div>
              </div>

              <p className="tnum text-right text-base font-semibold text-ink-900 dark:text-white">
                R$ {teacher.pricePerHour}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/professores"
          className="block border-t border-paper-200 bg-paper-50 px-5 py-3 text-center text-sm font-semibold text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          Ver todos os professores
        </Link>
      </div>

      <div className="pointer-events-none absolute -right-5 -bottom-4 hidden items-center gap-2 rounded-md border border-paper-200 bg-white px-3.5 py-2.5 shadow-[0_10px_24px_-12px_rgba(18,38,63,0.5)] transition-colors duration-300 dark:border-white/10 dark:bg-[#111111] sm:flex">
        <Video className="size-4 text-ocre-500" />
        <span className="text-xs font-medium text-ink-700 dark:text-zinc-300">Online e presencial</span>
      </div>

      <div className="pointer-events-none absolute -top-3 -right-4 hidden items-center gap-1.5 rounded-full border border-sage-600/20 bg-sage-50 px-3 py-1.5 shadow-[0_8px_18px_-10px_rgba(18,38,63,0.5)] lg:flex">
        <BadgeCheck className="size-3.5 text-sage-600" />
        <span className="text-xs font-medium text-sage-600">Verificado</span>
      </div>
    </div>
  )
}
