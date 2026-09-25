import { BadgeCheck, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from '@/components/ui/StarRating'
import { formatRating } from '@/lib/formatTeacher'
import type { Teacher } from '@/types/teacher'

type FeaturedPanelProps = {
  teachers: Teacher[]
  isLoading: boolean
}

const ROW =
  'flex items-center gap-3.5 border-b border-paper-100 px-5 py-4 last:border-b-0 dark:border-white/[0.06]'

function FeaturedSkeleton() {
  return (
    <ul>
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className={ROW}>
          <span className="size-10 shrink-0 animate-pulse rounded-sm bg-paper-200 dark:bg-white/10" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-3.5 w-28 animate-pulse rounded-sm bg-paper-200 dark:bg-white/10" />
            <span className="h-3 w-40 animate-pulse rounded-sm bg-paper-100 dark:bg-white/[0.06]" />
          </div>
          <span className="h-4 w-12 animate-pulse rounded-sm bg-paper-200 dark:bg-white/10" />
        </li>
      ))}
    </ul>
  )
}

export function FeaturedPanel({ teachers, isLoading }: FeaturedPanelProps) {
  const featured = teachers.slice(0, 3)
  const hasVerified = featured.some((teacher) => teacher.verified)
  const hasBothModalities = featured.some(
    (teacher) => teacher.modalities.includes('online') && teacher.modalities.includes('presencial'),
  )

  return (
    <div className="relative w-full">
      <div className="card-lifted overflow-hidden rounded-lg transition-all duration-300">
        <div className="flex items-center justify-between border-b border-paper-200 bg-paper-50 px-5 py-3 transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.03]">
          <span className="label-mono text-paper-600 dark:text-zinc-500">Em destaque</span>
          <span className="label-mono text-paper-500 dark:text-zinc-600">
            {featured.length > 0 ? `${featured.length} de ${teachers.length}` : 'Diretório'}
          </span>
        </div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : featured.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-paper-600 dark:text-zinc-400">
            Nenhum professor cadastrado ainda.
          </p>
        ) : (
          <ul>
            {featured.map((teacher) => (
              <li
                key={teacher.id}
                className={`${ROW} transition-colors hover:bg-paper-50 dark:hover:bg-white/[0.04]`}
              >
                <span className="raised-ink flex size-10 shrink-0 items-center justify-center rounded-sm bg-ink-800 text-xs font-semibold text-paper-50">
                  {teacher.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                    {teacher.name}
                  </p>
                  <p className="truncate text-xs text-paper-600 dark:text-zinc-400">
                    {teacher.subjects.join(' · ')}
                  </p>
                  {teacher.reviewCount > 0 ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRating rating={teacher.rating} />
                      <span className="tnum text-xs text-paper-600 dark:text-zinc-400">
                        {formatRating(teacher.rating)} ({teacher.reviewCount})
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-paper-500 dark:text-zinc-600">
                      Ainda sem avaliações
                    </p>
                  )}
                </div>

                <p className="tnum text-right text-base font-semibold text-ink-900 dark:text-white">
                  R$ {teacher.pricePerHour}
                </p>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/professores"
          className="block border-t border-paper-200 bg-paper-50 px-5 py-3 text-center text-sm font-semibold text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          Ver todos os professores
        </Link>
      </div>

      {hasBothModalities && (
        <div className="pointer-events-none absolute -right-5 -bottom-4 hidden items-center gap-2 rounded-md border border-paper-200 bg-white px-3.5 py-2.5 shadow-[0_10px_24px_-12px_rgba(18,38,63,0.5)] transition-colors duration-300 dark:border-white/10 dark:bg-night-600 dark:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)] sm:flex">
          <Video className="size-4 text-ocre-500" />
          <span className="text-xs font-medium text-ink-700 dark:text-zinc-300">
            Online e presencial
          </span>
        </div>
      )}

      {hasVerified && (
        <div className="pointer-events-none absolute -top-3 -right-4 hidden items-center gap-1.5 rounded-full border border-sage-600/20 bg-sage-50 px-3 py-1.5 shadow-[0_8px_18px_-10px_rgba(18,38,63,0.5)] dark:border-emerald-800/50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:shadow-[0_8px_18px_-10px_rgba(0,0,0,0.9)] lg:flex">
          <BadgeCheck className="size-3.5 text-sage-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-sage-600 dark:text-emerald-400">
            Verificado
          </span>
        </div>
      )}
    </div>
  )
}
