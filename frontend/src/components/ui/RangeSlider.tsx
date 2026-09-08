const THUMB_STYLES =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-600 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer'

type RangeSliderProps = {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

export function RangeSlider({ min, max, step = 1, value, onChange, formatValue }: RangeSliderProps) {
  const [lowValue, highValue] = value
  const toPercent = (rawValue: number) => ((rawValue - min) / (max - min)) * 100
  const label = formatValue ?? ((rawValue: number) => String(rawValue))

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-600"
          style={{ left: `${toPercent(lowValue)}%`, right: `${100 - toPercent(highValue)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lowValue}
          onChange={(event) => onChange([Math.min(Number(event.target.value), highValue), highValue])}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB_STYLES}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={highValue}
          onChange={(event) => onChange([lowValue, Math.max(Number(event.target.value), lowValue)])}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB_STYLES}`}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label(lowValue)}</span>
        <span>{label(highValue)}</span>
      </div>
    </div>
  )
}
