import { Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

const POPULAR_SUBJECTS = ['Matemática', 'Inglês', 'Física', 'Química', 'Programação']

export function SubjectSearchBar() {
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    console.log('busca de professores', { subject, location })
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-px overflow-hidden rounded-lg p-1.5 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:flex-row sm:items-stretch"
      >
        <label className="flex flex-1 flex-col gap-0.5 rounded-md px-3.5 py-2.5 transition-colors focus-within:bg-paper-50 dark:focus-within:bg-white/[0.06]">
          <span className="label-mono text-paper-500 dark:text-zinc-500">Matéria</span>
          <input
            type="text"
            placeholder="Matemática"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-paper-400 dark:text-white dark:placeholder:text-zinc-600"
          />
        </label>

        <span className="hidden w-px shrink-0 self-stretch bg-paper-200 dark:bg-white/10 sm:block" />

        <label className="flex flex-1 flex-col gap-0.5 rounded-md px-3.5 py-2.5 transition-colors focus-within:bg-paper-50 dark:focus-within:bg-white/[0.06]">
          <span className="label-mono text-paper-500 dark:text-zinc-500">Cidade ou CEP</span>
          <input
            type="text"
            placeholder="Mogi das Cruzes"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-paper-400 dark:text-white dark:placeholder:text-zinc-600"
          />
        </label>

        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-ink-800 px-6 py-3 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-ink-700 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500"
        >
          <Search className="size-4" />
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="label-mono mr-1 text-paper-500 dark:text-zinc-600">Populares</span>
        {POPULAR_SUBJECTS.map((popularSubject) => (
          <button
            key={popularSubject}
            type="button"
            onClick={() => setSubject(popularSubject)}
            className="rounded-full border border-paper-300 bg-white px-3 py-1 text-xs font-medium text-ink-700 shadow-[0_1px_0_var(--color-paper-200)] transition-[background-color,border-color,transform,box-shadow] duration-150 hover:border-ocre-400 hover:bg-ocre-100 active:translate-y-px active:shadow-none dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:shadow-none dark:hover:border-ocre-400/60 dark:hover:bg-ocre-400/10"
          >
            {popularSubject}
          </button>
        ))}
      </div>
    </div>
  )
}
