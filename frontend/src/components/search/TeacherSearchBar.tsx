import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

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
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      <Search className="ml-2 size-4 shrink-0 text-slate-400" />
      <input
        type="text"
        placeholder="Buscar por matéria, professor ou área..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      <Button type="submit" fullWidth={false} className="shrink-0 px-6">
        Buscar
      </Button>
    </form>
  )
}
