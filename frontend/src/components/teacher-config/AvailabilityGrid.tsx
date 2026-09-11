import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { TeachingModality } from '@/types/teacher-profile'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
] as const

/**
 * ONLINE / AMBOS — grouped hourly slots.
 * `key`   → start time stored in the availability Set  (e.g. "07:00")
 * `range` → interval text rendered inside the pill     (e.g. "07:00 – 08:00")
 */
const SHIFTS = [
  {
    label: 'Manhã',
    slots: [
      { key: '07:00', range: '07:00 – 08:00' },
      { key: '08:00', range: '08:00 – 09:00' },
      { key: '09:00', range: '09:00 – 10:00' },
      { key: '10:00', range: '10:00 – 11:00' },
      { key: '11:00', range: '11:00 – 12:00' },
    ],
  },
  {
    label: 'Tarde',
    slots: [
      { key: '14:00', range: '14:00 – 15:00' },
      { key: '15:00', range: '15:00 – 16:00' },
      { key: '16:00', range: '16:00 – 17:00' },
    ],
  },
  {
    label: 'Noite',
    slots: [
      { key: '19:00', range: '19:00 – 20:00' },
      { key: '20:00', range: '20:00 – 21:00' },
      { key: '21:00', range: '21:00 – 22:00' },
    ],
  },
] as const

/** Flat start-time keys — used only to count per-day selections in the online view */
const ALL_HOUR_KEYS = SHIFTS.flatMap((s) => s.slots.map((sl) => sl.key))

/** PRESENCIAL — shift-based slots stored as "seg-matutino", "seg-vespertino", etc. */
const SHIFT_SLOTS = [
  { key: 'matutino',   label: 'Matutino'   },
  { key: 'vespertino', label: 'Vespertino' },
  { key: 'noturno',    label: 'Noturno'    },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Shared pill class helper
// ─────────────────────────────────────────────────────────────────────────────

function pillCn(isOn: boolean, extra?: string) {
  return cn(
    'rounded-lg border text-center text-xs font-medium',
    'select-none transition-all duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ocre-500',
    'active:scale-95',
    isOn
      ? 'border-ink-900 bg-ink-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
      : 'border-paper-200 bg-white text-ink-600 hover:border-paper-400 hover:bg-paper-50 hover:text-ink-800',
    extra,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Selectable badge showing how many slots are active for a day */
function DayBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'selecionado' : 'selecionados'}`}
      className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-bold leading-none text-white"
    >
      {count}
    </span>
  )
}

// ── PRESENCIAL view ──────────────────────────────────────────────────────────

interface PresencialViewProps {
  selected: Set<string>
  onToggle: (key: string) => void
}

function PresencialView({ selected, onToggle }: PresencialViewProps) {
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Disponibilidade por turno">
      {DAYS.map((day) => {
        const dayCount = SHIFT_SLOTS.filter((s) =>
          selected.has(`${day.key}-${s.key}`),
        ).length

        return (
          <div
            key={day.key}
            className={cn(
              'flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3',
              'shadow-sm transition-[border-color] duration-200',
              dayCount > 0 ? 'border-ink-200' : 'border-paper-200 hover:border-paper-300',
            )}
          >
            {/* Day label + badge */}
            <div className="flex w-[5.5rem] shrink-0 items-center gap-2">
              <span className="text-sm font-semibold text-ink-800">{day.label}</span>
              <DayBadge count={dayCount} />
            </div>

            {/* Shift pills */}
            <div
              className="flex flex-1 gap-2"
              role="group"
              aria-label={`Turnos de ${day.label}`}
            >
              {SHIFT_SLOTS.map((shift) => {
                const cellKey = `${day.key}-${shift.key}`
                const isOn = selected.has(cellKey)
                return (
                  <button
                    key={cellKey}
                    type="button"
                    role="checkbox"
                    aria-checked={isOn}
                    aria-label={`${day.label} — ${shift.label}`}
                    onClick={() => onToggle(cellKey)}
                    className={pillCn(isOn, 'flex-1 py-2.5')}
                  >
                    {shift.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── ONLINE / AMBOS view (accordion) ─────────────────────────────────────────

interface OnlineViewProps {
  selected: Set<string>
  onToggle: (key: string) => void
}

function OnlineView({ selected, onToggle }: OnlineViewProps) {
  const [openDay, setOpenDay] = useState<string | null>(null)

  function handleDayClick(dayKey: string) {
    setOpenDay((prev) => (prev === dayKey ? null : dayKey))
  }

  return (
    <div className="flex flex-col gap-2">
      {DAYS.map((day) => {
        const isOpen = openDay === day.key
        const dayCount = ALL_HOUR_KEYS.filter((k) =>
          selected.has(`${day.key}-${k}`),
        ).length

        return (
          <div
            key={day.key}
            className={cn(
              'overflow-hidden rounded-xl border bg-white',
              'shadow-sm transition-[border-color,box-shadow] duration-200',
              isOpen
                ? 'border-ink-300 shadow-[0_2px_8px_-2px_rgba(18,38,63,0.12)]'
                : 'border-paper-200 hover:border-paper-300',
            )}
          >
            {/* Day header / accordion trigger */}
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`day-panel-${day.key}`}
              onClick={() => handleDayClick(day.key)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3.5',
                'select-none transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ocre-500',
                isOpen ? 'bg-paper-50/80' : 'hover:bg-paper-50/60',
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink-800">
                  {day.label}
                </span>
                <DayBadge count={dayCount} />
              </div>

              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={cn(
                  'transition-colors duration-150',
                  isOpen ? 'text-ink-600' : 'text-paper-400',
                )}
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </motion.span>
            </button>

            {/* Animated accordion panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`day-panel-${day.key}`}
                  role="group"
                  aria-label={`Horários disponíveis — ${day.label}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="mx-4 h-px bg-paper-100" aria-hidden="true" />

                  <div className="flex flex-col gap-6 p-4">
                    {SHIFTS.map((shift) => (
                      <div key={shift.label}>
                        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-paper-500">
                          {shift.label}
                        </p>
                        <div
                          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                          role="group"
                          aria-label={`${shift.label} — ${day.label}`}
                        >
                          {shift.slots.map((slot) => {
                            const cellKey = `${day.key}-${slot.key}`
                            return (
                              <button
                                key={cellKey}
                                type="button"
                                role="checkbox"
                                aria-checked={selected.has(cellKey)}
                                aria-label={`${day.label} — ${slot.range}`}
                                onClick={() => onToggle(cellKey)}
                                className={pillCn(
                                  selected.has(cellKey),
                                  'px-1.5 py-2.5 tabular-nums',
                                )}
                              >
                                {slot.range}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface AvailabilityGridProps {
  selected: Set<string>
  onToggle: (key: string) => void
  modality: TeachingModality
}

export function AvailabilityGrid({
  selected,
  onToggle,
  modality,
}: AvailabilityGridProps) {
  const totalSelected = selected.size
  const isPresencial = modality === 'presencial'

  const emptyHint = isPresencial
    ? 'Nenhum turno selecionado. Clique em Matutino, Vespertino ou Noturno para cada dia.'
    : 'Nenhum horário selecionado. Toque em um dia para expandir e escolher os horários.'

  const countLabel =
    totalSelected === 1
      ? `1 ${isPresencial ? 'turno' : 'horário'} selecionado`
      : `${totalSelected} ${isPresencial ? 'turnos' : 'horários'} selecionados`

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label-mono mb-1 text-paper-600">
        Grade de Disponibilidade
      </legend>

      {/* ── Cross-fade between presencial and online/ambos views ── */}
      <AnimatePresence mode="wait" initial={false}>
        {isPresencial ? (
          <motion.div
            key="presencial"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <PresencialView selected={selected} onToggle={onToggle} />
          </motion.div>
        ) : (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <OnlineView selected={selected} onToggle={onToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter hint */}
      <p className="mt-1 text-xs text-paper-400">
        {totalSelected === 0
          ? emptyHint
          : `${countLabel} · toque para alternar.`}
      </p>
    </fieldset>
  )
}
