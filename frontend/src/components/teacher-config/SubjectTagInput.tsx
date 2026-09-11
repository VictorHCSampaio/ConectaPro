import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

const MAX_SUBJECTS = 10

interface SubjectTagInputProps {
  subjects: string[]
  onAdd: (subject: string) => void
  onRemove: (subject: string) => void
  error?: string
}

export function SubjectTagInput({ subjects, onAdd, onRemove, error }: SubjectTagInputProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')

  function commit() {
    const value = draft.trim()
    if (!value) return
    if (subjects.includes(value)) {
      setDraft('')
      return
    }
    if (subjects.length >= MAX_SUBJECTS) return
    onAdd(value)
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
      return
    }
    if (event.key === 'Backspace' && !draft && subjects.length > 0) {
      onRemove(subjects.at(-1)!)
    }
  }

  const isAtLimit = subjects.length >= MAX_SUBJECTS

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="label-mono text-paper-600">
        Matérias / Disciplinas
      </label>

      <div
        className={cn(
          'inset-well flex min-h-[48px] flex-wrap gap-2 rounded-md px-3 py-2.5',
          'cursor-text transition-[border-color,box-shadow] duration-200',
          error
            ? 'border-alert-600/50 focus-within:border-alert-600'
            : 'hover:border-paper-400 focus-within:border-ocre-400 focus-within:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)]',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {subjects.map((subject) => (
          <span
            key={subject}
            className="inline-flex items-center gap-1.5 rounded-sm bg-ink-800 px-2.5 py-1 text-xs font-semibold text-paper-50"
          >
            {subject}
            <button
              type="button"
              aria-label={`Remover ${subject}`}
              onClick={() => onRemove(subject)}
              className="flex items-center text-paper-400 transition-colors hover:text-white focus-visible:outline-none"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {!isAtLimit && (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            placeholder={subjects.length === 0 ? 'Ex: Matemática, Inglês… Enter para adicionar' : ''}
            aria-label="Adicionar matéria"
            aria-invalid={Boolean(error)}
            className="min-w-36 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-paper-400 focus:outline-none"
          />
        )}
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-alert-600">
          {error}
        </p>
      ) : (
        <p className="text-xs text-paper-400">
          Pressione <kbd className="rounded bg-paper-200 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> ou vírgula para
          adicionar · {subjects.length}/{MAX_SUBJECTS} matérias
        </p>
      )}
    </div>
  )
}
