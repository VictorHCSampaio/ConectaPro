import { Checkbox } from '@/components/ui/Checkbox'
import { Radio } from '@/components/ui/Radio'
import { RangeSlider } from '@/components/ui/RangeSlider'
import { Switch } from '@/components/ui/Switch'
import { MAX_PRICE_PER_HOUR, MIN_PRICE_PER_HOUR, SUBJECT_OPTIONS } from '@/lib/mockTeachers'
import type { ModalityOption } from '@/types/teacher'

type FilterPanelProps = {
  selectedSubjects: string[]
  onToggleSubject: (subject: string) => void
  modality: ModalityOption
  onModalityChange: (modality: ModalityOption) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  onlyVerified: boolean
  onOnlyVerifiedChange: (value: boolean) => void
  onClear: () => void
}

export function FilterPanel({
  selectedSubjects,
  onToggleSubject,
  modality,
  onModalityChange,
  priceRange,
  onPriceRangeChange,
  onlyVerified,
  onOnlyVerifiedChange,
  onClear,
}: FilterPanelProps) {
  return (
    <aside className="flex h-fit flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition-shadow duration-300 hover:shadow-md hover:shadow-slate-200/70">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Filtros</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Limpar
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Matéria
        </span>
        <div className="flex flex-col gap-2.5">
          {SUBJECT_OPTIONS.map((subject) => (
            <Checkbox
              key={subject}
              label={subject}
              checked={selectedSubjects.includes(subject)}
              onChange={() => onToggleSubject(subject)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Modalidade
        </span>
        <div className="flex flex-col gap-2.5">
          <Radio
            name="modalidade"
            label="Online"
            checked={modality === 'online'}
            onChange={() => onModalityChange('online')}
          />
          <Radio
            name="modalidade"
            label="Presencial"
            checked={modality === 'presencial'}
            onChange={() => onModalityChange('presencial')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Valor da hora-aula
        </span>
        <RangeSlider
          min={MIN_PRICE_PER_HOUR}
          max={MAX_PRICE_PER_HOUR}
          step={5}
          value={priceRange}
          onChange={onPriceRangeChange}
          formatValue={(value) => `R$ ${value}`}
        />
      </div>

      <Switch label="Somente verificados" checked={onlyVerified} onChange={onOnlyVerifiedChange} />
    </aside>
  )
}
