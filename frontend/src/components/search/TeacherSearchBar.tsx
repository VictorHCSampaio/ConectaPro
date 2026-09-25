import { Search } from 'lucide-react'
import type { FormEvent } from 'react'

type TeacherSearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export function TeacherSearchBar({ value, onChange }: TeacherSearchBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex items-stretch gap-1 rounded-lg p-1.5 transition-all duration-300 dark:border-white/10"
    >
      <span className="flex items-center pl-3 text-paper-500 dark:text-zinc-500">
        <Search className="size-4" />
      </span>
      <input
        type="text"
        placeholder="Buscar por matéria, professor ou área"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-paper-400 dark:text-white dark:placeholder:text-zinc-600"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-ink-800 px-6 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-ink-700 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500"
      >
        Buscar
      </button>
    </form>
  )
}
