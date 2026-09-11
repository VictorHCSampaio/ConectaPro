import { useEffect, useId, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { AVAILABLE_SUBJECTS } from "@/lib/mock-subjects";
import type { SubjectExperience } from "@/types/teacher-profile";

const MAX_SUBJECTS = 10;
const LEVELS = ["Iniciante", "Intermediário", "Avançado"] as const;

interface SubjectExperienceInputProps {
  subjects: SubjectExperience[];
  onChange: (subjects: SubjectExperience[]) => void;
  error?: string;
}

export function SubjectExperienceInput({
  subjects,
  onChange,
  error,
}: SubjectExperienceInputProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedIds = new Set(subjects.map((s) => s.id));

  const suggestions = AVAILABLE_SUBJECTS.filter(
    (s) =>
      !selectedIds.has(s.id) &&
      s.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function addSubject(subject: { id: string; name: string }) {
    onChange([
      ...subjects,
      { id: subject.id, name: subject.name, observation: "", level: "Iniciante" },
    ]);
    setQuery("");
    setOpen(false);
  }

  function removeSubject(id: string) {
    onChange(subjects.filter((s) => s.id !== id));
  }

  function updateSubject(id: string, patch: Partial<SubjectExperience>) {
    onChange(subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isAtLimit = subjects.length >= MAX_SUBJECTS;

  return (
    <div className="flex flex-col gap-3">
      <span className="label-mono text-paper-600">Matérias / Disciplinas</span>

      {!isAtLimit && (
        <div ref={containerRef} className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-paper-500">
            <Search className="size-4" />
          </span>
          <input
            id={inputId}
            type="text"
            autoComplete="off"
            value={query}
            placeholder="Buscar matéria… (ex: Matemática)"
            aria-label="Buscar matéria"
            aria-invalid={Boolean(error)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={cn(
              "inset-well w-full rounded-md py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-paper-400",
              "transition-[border-color,box-shadow] duration-200 focus:outline-none",
              error
                ? "border-alert-600/50 focus:border-alert-600"
                : "hover:border-paper-400 focus:border-ocre-400 focus:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)]",
            )}
          />

          {open && suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Sugestões de matérias"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-paper-200 bg-white shadow-[0_8px_24px_-8px_rgba(18,38,63,0.18)]"
            >
              {suggestions.slice(0, 8).map((subject) => (
                <li key={subject.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSubject(subject);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-ink-800 transition-colors hover:bg-ocre-50 hover:text-ink-900 focus-visible:bg-ocre-50 focus-visible:outline-none"
                  >
                    {subject.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-alert-600">
          {error}
        </p>
      )}

      {subjects.length > 0 && (
        <div className="flex flex-col gap-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-md border border-paper-200 bg-paper-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">
                  {subject.name}
                </span>
                <button
                  type="button"
                  aria-label={`Remover ${subject.name}`}
                  onClick={() => removeSubject(subject.id)}
                  className="flex items-center rounded p-1 text-paper-400 transition-colors hover:bg-alert-50 hover:text-alert-600 focus-visible:outline-none"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="label-mono text-xs text-paper-500">
                    Ramo principal / Observação
                  </label>
                  <input
                    type="text"
                    value={subject.observation}
                    placeholder="Ex: Bhaskara, Redação ENEM"
                    onChange={(e) =>
                      updateSubject(subject.id, { observation: e.target.value })
                    }
                    className="inset-well w-full rounded-md px-4 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 transition-[border-color,box-shadow] duration-200 focus:outline-none hover:border-paper-400 focus:border-ocre-400 focus:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="label-mono text-xs text-paper-500">Nível</span>
                  <div className="flex gap-2">
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateSubject(subject.id, { level })}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                          subject.level === level
                            ? "border-ocre-400 bg-ocre-50 text-ink-900"
                            : "border-paper-200 bg-white text-paper-500 hover:border-paper-400 hover:text-ink-800",
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-paper-400">
        {subjects.length}/{MAX_SUBJECTS} matérias adicionadas
      </p>
    </div>
  );
}
