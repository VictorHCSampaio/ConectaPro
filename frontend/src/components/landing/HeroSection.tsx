import { FeaturedPanel } from '@/components/landing/FeaturedPanel'
import { SubjectSearchBar } from '@/components/landing/SubjectSearchBar'
import { Counter } from '@/components/motion/Counter'
import { Reveal } from '@/components/motion/Reveal'
import { MIN_PRICE_PER_HOUR, MOCK_TEACHERS } from '@/lib/mockTeachers'

const SUBJECT_COUNT = new Set(MOCK_TEACHERS.flatMap((teacher) => teacher.subjects)).size

const FIGURES = [
  { value: MOCK_TEACHERS.length, prefix: '', label: 'professores cadastrados' },
  { value: SUBJECT_COUNT, prefix: '', label: 'matérias atendidas' },
  { value: MIN_PRICE_PER_HOUR, prefix: 'R$ ', label: 'menor hora-aula' },
]

export function HeroSection() {
  return (
    <section className="grain border-b border-paper-200 transition-colors duration-300 dark:border-white/10">
      <div className="relative z-1 mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-20 lg:py-24">
        <Reveal className="flex flex-col gap-6">
          <p className="label-mono flex items-center gap-2.5 text-paper-600 dark:text-zinc-500">
            <span className="h-px w-8 bg-ocre-400" />
            Diretório de aulas particulares
          </p>

          <h1 className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-ink-900 dark:text-white sm:text-[3.4rem]">
            Compare professores particulares antes de escolher.
          </h1>

          <p className="max-w-md leading-relaxed text-ink-600 dark:text-zinc-400">
            Formação, modalidade, avaliações e valor da hora-aula de cada professor na mesma tela.
          </p>

          <SubjectSearchBar />
        </Reveal>

        <Reveal delay={0.12} className="lg:pl-6">
          <FeaturedPanel />
        </Reveal>
      </div>

      <div className="relative z-1 border-t border-paper-200 transition-colors duration-300 dark:border-white/10">
        <dl className="mx-auto grid max-w-6xl divide-y divide-paper-200 px-6 dark:divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FIGURES.map((figure) => (
            <div key={figure.label} className="py-7 sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <dt className="tnum text-3xl font-semibold text-ink-900 dark:text-white">
                <Counter to={figure.value} prefix={figure.prefix} />
              </dt>
              <dd className="mt-1 text-sm text-paper-600 dark:text-zinc-400">{figure.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
