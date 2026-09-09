const THUMB_STYLES =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-paper-300 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[inset_0_1px_0_#fff,0_2px_3px_rgba(18,38,63,0.35)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-paper-300 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[inset_0_1px_0_#fff,0_2px_3px_rgba(18,38,63,0.35)] [&::-moz-range-thumb]:cursor-grab'

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
    <div className="flex flex-col gap-3">
      <div className="relative h-5">
        <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full border border-paper-300 bg-paper-100 shadow-[inset_0_2px_3px_rgba(18,38,63,0.18)]" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
          style={{ left: `${toPercent(lowValue)}%`, right: `${100 - toPercent(highValue)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lowValue}
          onChange={(event) => onChange([Math.min(Number(event.target.value), highValue), highValue])}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB_STYLES}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={highValue}
          onChange={(event) => onChange([lowValue, Math.max(Number(event.target.value), lowValue)])}
          className={`pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent ${THUMB_STYLES}`}
        />
      </div>
      <div className="tnum flex items-center justify-between text-xs text-paper-600">
        <span>{label(lowValue)}</span>
        <span>{label(highValue)}</span>
      </div>
    </div>
  )
}
