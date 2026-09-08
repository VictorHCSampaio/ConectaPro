type SwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className="relative inline-flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <div className="h-6 w-11 shrink-0 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-brand-600" />
      <div className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  )
}
