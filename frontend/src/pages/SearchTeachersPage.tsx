import { useMemo, useState } from 'react'
import { FilterPanel } from '@/components/search/FilterPanel'
import { TeacherResultCard } from '@/components/search/TeacherResultCard'
import { TeacherSearchBar } from '@/components/search/TeacherSearchBar'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Reveal } from '@/components/motion/Reveal'
import { MAX_PRICE_PER_HOUR, MIN_PRICE_PER_HOUR, MOCK_TEACHERS } from '@/lib/mockTeachers'
import type { ModalityOption } from '@/types/teacher'

type SortOption = 'relevancia' | 'menor-preco' | 'maior-avaliacao'

const DEFAULT_SUBJECTS = ['Matemática', 'Inglês']
const DEFAULT_PRICE_RANGE: [number, number] = [MIN_PRICE_PER_HOUR, MAX_PRICE_PER_HOUR]

export function SearchTeachersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(DEFAULT_SUBJECTS)
  const [modality, setModality] = useState<ModalityOption>('online')
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>('relevancia')

  function toggleSubject(subject: string) {
    setSelectedSubjects((previous) =>
      previous.includes(subject)
        ? previous.filter((item) => item !== subject)
        : [...previous, subject],
    )
  }

  function clearFilters() {
    setSelectedSubjects([])
    setModality('online')
    setPriceRange(DEFAULT_PRICE_RANGE)
    setOnlyVerified(false)
  }

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const matches = MOCK_TEACHERS.filter((teacher) => {
      const matchesQuery =
        query.length === 0 ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjects.some((subject) => subject.toLowerCase().includes(query))

      const matchesSubjects =
        selectedSubjects.length === 0 ||
        teacher.subjects.some((subject) => selectedSubjects.includes(subject))

      const matchesModality = teacher.modalities.includes(modality)

      const matchesPrice =
        teacher.pricePerHour >= priceRange[0] && teacher.pricePerHour <= priceRange[1]

      const matchesVerified = !onlyVerified || teacher.verified

      return matchesQuery && matchesSubjects && matchesModality && matchesPrice && matchesVerified
    })

    if (sortOption === 'menor-preco') {
      return [...matches].sort((a, b) => a.pricePerHour - b.pricePerHour)
    }
    if (sortOption === 'maior-avaliacao') {
      return [...matches].sort((a, b) => b.rating - a.rating)
    }
    return matches
  }, [searchQuery, selectedSubjects, modality, priceRange, onlyVerified, sortOption])

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-[#0a0a0a]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <p className="label-mono flex items-center gap-2.5 text-paper-600 dark:text-zinc-500">
          <span className="h-px w-8 bg-ocre-400" />
          Diretório
        </p>
        <h1 className="mt-3 mb-6 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Professores particulares
        </h1>

        <TeacherSearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
          <FilterPanel
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            modality={modality}
            onModalityChange={setModality}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onlyVerified={onlyVerified}
            onOnlyVerifiedChange={setOnlyVerified}
            onClear={clearFilters}
          />

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-200 pb-3 dark:border-white/10">
              <p className="text-sm text-ink-700 dark:text-zinc-400">
                <span className="tnum font-semibold text-ink-900 dark:text-white">{filteredTeachers.length}</span>{' '}
                {filteredTeachers.length === 1
                  ? 'professor encontrado'
                  : 'professores encontrados'}
              </p>

              <label className="flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
                Ordenar por
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="rounded-md border border-paper-300 bg-white px-2.5 py-1.5 text-sm text-ink-800 shadow-[inset_0_1px_0_#fff,0_1px_0_var(--color-paper-200)] outline-none transition-all hover:border-paper-400 focus:border-ocre-400 dark:border-white/10 dark:bg-black/40 dark:text-white dark:shadow-none dark:hover:border-white/20 dark:focus:border-white/30"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-avaliacao">Maior avaliação</option>
                </select>
              </label>
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="inset-well flex flex-col items-start gap-2 rounded-lg p-10 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-lg font-semibold text-ink-900 dark:text-white">
                  Nenhum professor corresponde a esses filtros.
                </p>
                <p className="text-sm text-ink-600 dark:text-zinc-400">
                  Tente ampliar a faixa de valor ou remover uma matéria.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] transition-all duration-150 active:translate-y-0.5 active:shadow-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:bg-white/[0.08]"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {filteredTeachers.map((teacher, index) => (
                  <Reveal key={teacher.id} delay={Math.min(index, 5) * 0.05}>
                    <li>
                      <TeacherResultCard teacher={teacher} />
                    </li>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
