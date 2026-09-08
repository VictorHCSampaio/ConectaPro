import { useMemo, useState } from 'react'
import { FilterPanel } from '@/components/search/FilterPanel'
import { TeacherResultCard } from '@/components/search/TeacherResultCard'
import { TeacherSearchBar } from '@/components/search/TeacherSearchBar'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <TeacherSearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
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

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-bold text-slate-900">Professores encontrados</h1>
                <span className="text-sm text-slate-500">
                  {filteredTeachers.length} resultado{filteredTeachers.length === 1 ? '' : 's'}
                </span>
              </div>

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-400"
              >
                <option value="relevancia">Ordenar: Relevância</option>
                <option value="menor-preco">Ordenar: Menor preço</option>
                <option value="maior-avaliacao">Ordenar: Maior avaliação</option>
              </select>
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-sm text-slate-500">
                  Nenhum professor encontrado com esses filtros.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredTeachers.map((teacher) => (
                  <TeacherResultCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
