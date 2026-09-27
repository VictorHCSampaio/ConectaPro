import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/Checkbox'
import { Radio } from '@/components/ui/Radio'
import { RangeSlider } from '@/components/ui/RangeSlider'
import { Switch } from '@/components/ui/Switch'
import type { ModalityFilter } from '@/types/teacher'

type FilterPanelProps = {
  subjectOptions: string[]
  maxDistance: number | null
  onMaxDistanceChange: (distance: number | null) => void
  distanceAvailable: boolean
  minPrice: number
  maxPrice: number
  selectedSubjects: string[]
  onToggleSubject: (subject: string) => void
  modality: ModalityFilter
  onModalityChange: (modality: ModalityFilter) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  onlyVerified: boolean
  onOnlyVerifiedChange: (value: boolean) => void
  verifiedAvailable: boolean
  activeCount: number
  onClear: () => void
}

const SECTION = 'flex flex-col gap-3 border-b border-paper-200 px-5 py-5 dark:border-white/10'
const SECTION_TITLE = 'label-mono text-paper-500 dark:text-zinc-500'
const HINT = 'text-xs text-paper-500 dark:text-zinc-600'

const DISTANCE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Qualquer distância', value: null },
  { label: 'Até 5 km', value: 5 },
  { label: 'Até 10 km', value: 10 },
  { label: 'Até 20 km', value: 20 },
  { label: 'Até 50 km', value: 50 },
]

const MODALITY_OPTIONS: { label: string; value: ModalityFilter }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Online', value: 'online' },
  { label: 'Presencial', value: 'presencial' },
]

export function FilterPanel({
  subjectOptions,
  maxDistance,
  onMaxDistanceChange,
  distanceAvailable,
  minPrice,
  maxPrice,
  selectedSubjects,
  onToggleSubject,
  modality,
  onModalityChange,
  priceRange,
  onPriceRangeChange,
  onlyVerified,
  onOnlyVerifiedChange,
  verifiedAvailable,
  activeCount,
  onClear,
}: FilterPanelProps) {
  return (
    <aside className="card h-fit rounded-lg transition-all duration-300">
      <div className="flex items-center justify-between border-b border-paper-200 px-5 py-3.5 dark:border-white/10">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Filtros
          {activeCount > 0 && (
            <span className="tnum rounded-full bg-ocre-400/20 px-2 py-0.5 text-xs font-semibold text-ocre-600 dark:bg-ocre-400/15 dark:text-ocre-200">
              {activeCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="label-mono rounded-sm px-2 py-1 text-paper-600 transition-colors hover:bg-paper-100 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-white"
        >
          Limpar
        </button>
      </div>

      <div className={SECTION}>
        <span className={SECTION_TITLE}>Distância</span>
        <div className="flex flex-col gap-2.5">
          {DISTANCE_OPTIONS.map((option) => (
            <Radio
              key={option.label}
              name="distancia"
              label={option.label}
              disabled={!distanceAvailable}
              checked={maxDistance === option.value}
              onChange={() => onMaxDistanceChange(option.value)}
            />
          ))}
        </div>
        {!distanceAvailable && (
          <p className={HINT}>
            Cadastre seu CEP em{' '}
            <Link
              to="/profile/edit"
              className="font-medium text-ocre-600 underline underline-offset-2 dark:text-ocre-400"
            >
              Meu perfil
            </Link>{' '}
            para filtrar por distância.
          </p>
        )}
      </div>

      <div className={SECTION}>
        <span className={SECTION_TITLE}>Matéria</span>
        <div className="flex flex-col gap-2.5">
          {subjectOptions.length === 0 ? (
            <p className={HINT}>Nenhuma matéria cadastrada ainda.</p>
          ) : (
            subjectOptions.map((subject) => (
              <Checkbox
                key={subject}
                label={subject}
                checked={selectedSubjects.includes(subject)}
                onChange={() => onToggleSubject(subject)}
              />
            ))
          )}
        </div>
      </div>

      <div className={SECTION}>
        <span className={SECTION_TITLE}>Modalidade</span>
        <div className="flex flex-col gap-2.5">
          {MODALITY_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="modalidade"
              label={option.label}
              checked={modality === option.value}
              onChange={() => onModalityChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className={SECTION}>
        <span className={SECTION_TITLE}>Valor da hora-aula</span>
        {minPrice === maxPrice ? (
          <p className={HINT}>Todos os professores cobram R$ {minPrice} por hora.</p>
        ) : (
          <RangeSlider
            min={minPrice}
            max={maxPrice}
            step={5}
            value={priceRange}
            onChange={onPriceRangeChange}
            formatValue={(value) => `R$ ${value}`}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 px-5 py-5">
        <Switch
          label="Somente verificados"
          checked={onlyVerified}
          onChange={onOnlyVerifiedChange}
          disabled={!verifiedAvailable}
        />
        {!verifiedAvailable && <p className={HINT}>Nenhum professor verificado no momento.</p>}
      </div>
    </aside>
  )
}
