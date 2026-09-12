import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Switch } from "@/components/ui/Switch";
import type { ModalityOption } from "@/types/teacher";

type FilterPanelProps = {
  subjectOptions: string[];
  minPrice: number;
  maxPrice: number;
  selectedSubjects: string[];
  onToggleSubject: (subject: string) => void;
  modality: ModalityOption;
  onModalityChange: (modality: ModalityOption) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onlyVerified: boolean;
  onOnlyVerifiedChange: (value: boolean) => void;
  onClear: () => void;
};

const SECTION_TITLE = "label-mono text-paper-500";

export function FilterPanel({
  subjectOptions,
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
  onClear,
}: FilterPanelProps) {
  return (
    <aside className="card h-fit rounded-lg transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-lg dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between border-b border-paper-200 px-5 py-3.5 dark:border-white/10">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Filtros</h2>
        <button
          type="button"
          onClick={onClear}
          className="label-mono rounded-sm px-2 py-1 text-paper-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-white"
        >
          Limpar
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b border-paper-200 px-5 py-5 dark:border-white/10">
        <span className={SECTION_TITLE}>Matéria</span>
        <div className="flex flex-col gap-2.5">
          {subjectOptions.length === 0 && (
            <p className="text-sm text-paper-500">
              Nenhuma matéria cadastrada ainda.
            </p>
          )}
          {subjectOptions.map((subject) => (
            <Checkbox
              key={subject}
              label={subject}
              checked={selectedSubjects.includes(subject)}
              onChange={() => onToggleSubject(subject)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-paper-200 px-5 py-5 dark:border-white/10">
        <span className={SECTION_TITLE}>Modalidade</span>
        <div className="flex flex-col gap-2.5">
          <Radio
            name="modalidade"
            label="Online"
            checked={modality === "online"}
            onChange={() => onModalityChange("online")}
          />
          <Radio
            name="modalidade"
            label="Presencial"
            checked={modality === "presencial"}
            onChange={() => onModalityChange("presencial")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-paper-200 px-5 py-5 dark:border-white/10">
        <span className={SECTION_TITLE}>Valor da hora-aula</span>
        <RangeSlider
          min={minPrice}
          max={maxPrice}
          step={5}
          value={priceRange}
          onChange={onPriceRangeChange}
          formatValue={(value) => `R$ ${value}`}
        />
      </div>

      <div className="px-5 py-5">
        <Switch
          label="Somente verificados"
          checked={onlyVerified}
          onChange={onOnlyVerifiedChange}
        />
      </div>
    </aside>
  );
}
