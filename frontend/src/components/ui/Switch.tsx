type SwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Switch({ label, checked, onChange, disabled = false }: SwitchProps) {
  return (
    <label
      className={`relative inline-flex items-center gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <div className="pressed h-6 w-11 shrink-0 rounded-full border border-paper-300 bg-paper-100 transition-colors duration-200 peer-checked:border-ink-800 peer-checked:bg-ink-800 peer-focus-visible:ring-3 peer-focus-visible:ring-ocre-400/40 dark:border-zinc-600 dark:bg-zinc-800 dark:peer-checked:border-ocre-500 dark:peer-checked:bg-ocre-500" />
      <div className="pointer-events-none absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(18,38,63,0.4),inset_0_1px_0_#fff] transition-transform duration-200 ease-out peer-checked:translate-x-5 dark:bg-zinc-200" />
      <span className="text-sm text-ink-700 dark:text-zinc-300">{label}</span>
    </label>
  )
}
