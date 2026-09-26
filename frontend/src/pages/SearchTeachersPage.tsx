import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { FilterPanel } from '@/components/search/FilterPanel'
import { TeacherResultCard } from '@/components/search/TeacherResultCard'
import { TeacherSearchBar } from '@/components/search/TeacherSearchBar'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Reveal } from '@/components/motion/Reveal'
import { useAuth } from '@/hooks/useAuth'
import { listarProfessores } from '@/lib/professorService'
import type { ModalityFilter, Teacher } from '@/types/teacher'

type SortOption = 'relevancia' | 'menor-preco' | 'maior-avaliacao' | 'mais-proximos'

type ResultsMessageProps = {
  title: string
  description: string
  children?: ReactNode
}

function ResultsMessage({ title, description, children }: ResultsMessageProps) {
  return (
    <div className="inset-well flex flex-col items-start gap-2 rounded-lg p-10">
      <p className="text-lg font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="text-sm text-ink-600 dark:text-zinc-400">{description}</p>
      {children}
    </div>
  )
}

const FALLBACK_PRICE_RANGE: [number, number] = [0, 200]

function distanciaPara(teacher: Teacher) {
  return teacher.distanceKm ?? Number.POSITIVE_INFINITY
}

export function SearchTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [modality, setModality] = useState<ModalityFilter>('todas')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [maxDistance, setMaxDistance] = useState<number | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('relevancia')

  const { user } = useAuth()

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    setLoadError(null)

    listarProfessores()
      .then((list) => {
        if (isActive) setTeachers(list)
      })
      .catch(() => {
        if (isActive) setLoadError('Não foi possível carregar os professores.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [user?.email])

  const subjectOptions = useMemo(
    () => [...new Set(teachers.flatMap((teacher) => teacher.subjects))].sort(),
    [teachers],
  )

  const priceBounds = useMemo<[number, number]>(() => {
    if (teachers.length === 0) return FALLBACK_PRICE_RANGE
    const prices = teachers.map((teacher) => teacher.pricePerHour)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [teachers])

  const activePriceRange = priceRange ?? priceBounds

  const verifiedAvailable = useMemo(() => teachers.some((teacher) => teacher.verified), [teachers])

  const ratingsAvailable = useMemo(
    () => teachers.some((teacher) => teacher.reviewCount > 0),
    [teachers],
  )

  const distanceAvailable = useMemo(
    () => teachers.some((teacher) => teacher.distanceKm != null),
    [teachers],
  )

  const activeMaxDistance = distanceAvailable ? maxDistance : null

  const activeFilterCount =
    selectedSubjects.length +
    (modality === 'todas' ? 0 : 1) +
    (priceRange === null ? 0 : 1) +
    (onlyVerified ? 1 : 0) +
    (activeMaxDistance === null ? 0 : 1)

  function toggleSubject(subject: string) {
    setSelectedSubjects((previous) =>
      previous.includes(subject)
        ? previous.filter((item) => item !== subject)
        : [...previous, subject],
    )
  }

  function clearFilters() {
    setSelectedSubjects([])
    setModality('todas')
    setPriceRange(null)
    setOnlyVerified(false)
    setMaxDistance(null)
  }

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const matches = teachers.filter((teacher) => {
      const matchesQuery =
        query.length === 0 ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjects.some((subject) => subject.toLowerCase().includes(query))

      const matchesSubjects =
        selectedSubjects.length === 0 ||
        teacher.subjects.some((subject) => selectedSubjects.includes(subject))

      const matchesModality = modality === 'todas' || teacher.modalities.includes(modality)

      const matchesPrice =
        teacher.pricePerHour >= activePriceRange[0] && teacher.pricePerHour <= activePriceRange[1]

      const matchesVerified = !onlyVerified || teacher.verified

      const matchesDistance =
        activeMaxDistance === null ||
        (teacher.distanceKm != null && teacher.distanceKm <= activeMaxDistance)

      return (
        matchesQuery &&
        matchesSubjects &&
        matchesModality &&
        matchesPrice &&
        matchesVerified &&
        matchesDistance
      )
    })

    if (sortOption === 'menor-preco') {
      return [...matches].sort((a, b) => a.pricePerHour - b.pricePerHour)
    }
    if (sortOption === 'maior-avaliacao') {
      return [...matches].sort((a, b) => b.rating - a.rating)
    }
    if (sortOption === 'mais-proximos') {
      return [...matches].sort((a, b) => distanciaPara(a) - distanciaPara(b))
    }
    return matches
  }, [
    teachers,
    searchQuery,
    selectedSubjects,
    modality,
    activePriceRange,
    onlyVerified,
    activeMaxDistance,
    sortOption,
  ])

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <p className="label-mono text-paper-600 dark:text-zinc-500">Diretório</p>
        <h1 className="mt-3 mb-6 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Professores particulares
        </h1>

        <TeacherSearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
          <FilterPanel
            subjectOptions={subjectOptions}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
            distanceAvailable={distanceAvailable}
            minPrice={priceBounds[0]}
            maxPrice={priceBounds[1]}
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            modality={modality}
            onModalityChange={setModality}
            priceRange={activePriceRange}
            onPriceRangeChange={setPriceRange}
            onlyVerified={onlyVerified}
            onOnlyVerifiedChange={setOnlyVerified}
            verifiedAvailable={verifiedAvailable}
            activeCount={activeFilterCount}
            onClear={clearFilters}
          />

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-200 pb-3 dark:border-white/10">
              <p className="text-sm text-ink-700 dark:text-zinc-300">
                <span className="tnum font-semibold text-ink-900 dark:text-white">
                  {filteredTeachers.length}
                </span>{' '}
                {filteredTeachers.length === 1 ? 'professor encontrado' : 'professores encontrados'}
              </p>

              <label className="flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
                Ordenar por
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="raised rounded-md border border-paper-300 bg-white px-2.5 py-1.5 text-sm text-ink-800 outline-none transition-colors hover:border-paper-400 focus:border-ocre-400 dark:border-white/10 dark:bg-night-600 dark:text-white dark:hover:border-white/20 dark:focus:border-ocre-500"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-avaliacao" disabled={!ratingsAvailable}>
                    Maior avaliação
                  </option>
                  <option value="mais-proximos" disabled={!distanceAvailable}>
                    Mais próximos
                  </option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="inset-well flex items-center gap-2 rounded-lg p-10 text-sm text-paper-600 dark:text-zinc-400">
                <Loader2 className="size-4 animate-spin" />
                Carregando professores…
              </div>
            ) : loadError ? (
              <ResultsMessage
                title={loadError}
                description="Verifique sua conexão e tente novamente em instantes."
              />
            ) : teachers.length === 0 ? (
              <ResultsMessage
                title="Nenhum professor cadastrado ainda."
                description="Assim que um professor configurar o perfil, ele aparece aqui."
              />
            ) : filteredTeachers.length === 0 ? (
              <ResultsMessage
                title="Nenhum professor corresponde a esses filtros."
                description="Tente ampliar a faixa de valor ou remover uma matéria."
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  className="raised mt-2 rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition-all duration-150 active:translate-y-0.5 active:shadow-none dark:border-white/10 dark:bg-night-600 dark:text-white dark:hover:bg-night-800"
                >
                  Limpar filtros
                </button>
              </ResultsMessage>
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
