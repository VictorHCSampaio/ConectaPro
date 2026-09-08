import { BookOpen, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

const POPULAR_SUBJECTS = ['Matemática', 'Inglês', 'Física', 'Violão', 'Programação']

export function SubjectSearchBar() {
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    console.log('busca de professores', { subject, location })
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row sm:items-center"
      >
        <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 sm:border-r sm:border-slate-100">
          <BookOpen className="size-4 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Ex.: Matemática"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5">
          <MapPin className="size-4 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="CEP ou localização"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <Button type="submit" fullWidth={false} icon={<Search className="size-4" />} className="shrink-0">
          Buscar
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Populares:</span>
        {POPULAR_SUBJECTS.map((popularSubject) => (
          <button
            key={popularSubject}
            type="button"
            onClick={() => setSubject(popularSubject)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {popularSubject}
          </button>
        ))}
      </div>
    </div>
  )
}
