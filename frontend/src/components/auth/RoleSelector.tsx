import { GraduationCap, Presentation } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import type { UserRole } from '@/types/auth'

type RoleOption = {
  value: UserRole
  title: string
  description: string
  icon: ReactNode
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'ALUNO',
    title: 'Sou aluno',
    description: 'Quero encontrar professores',
    icon: <GraduationCap className="size-5" />,
  },
  {
    value: 'PROFESSOR',
    title: 'Sou professor',
    description: 'Quero oferecer minhas aulas',
    icon: <Presentation className="size-5" />,
  },
]

type RoleSelectorProps = {
  value: UserRole | null
  onChange: (role: UserRole) => void
  onBlur?: () => void
  error?: string
}

export function RoleSelector({ value, onChange, onBlur, error }: RoleSelectorProps) {
  const groupName = useId()

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label-mono mb-2 text-paper-600">Como você quer usar</legend>

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = value === option.value

          return (
            <label
              key={option.value}
              className={cn(
                'group relative flex cursor-pointer flex-col gap-1.5 rounded-md border p-3.5',
                'transition-[border-color,background-color,box-shadow,transform] duration-200',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ocre-500',
                isSelected
                  ? 'border-ocre-400 bg-white shadow-[inset_0_1px_0_#fff,0_0_0_3px_rgba(192,161,74,0.18),0_8px_16px_-12px_rgba(18,38,63,0.4)]'
                  : 'border-paper-300 bg-paper-100 shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),inset_0_-1px_0_#fff] hover:border-paper-400',
                error && !isSelected && 'border-alert-600/50',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                className="sr-only"
              />
              <span
                className={cn(
                  'transition-colors',
                  isSelected ? 'text-ocre-500' : 'text-paper-500 group-hover:text-ink-600',
                )}
              >
                {option.icon}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isSelected ? 'text-ink-900' : 'text-ink-700',
                )}
              >
                {option.title}
              </span>
              <span className="text-xs leading-snug text-ink-600">{option.description}</span>
            </label>
          )
        })}
      </div>

      {error && <p className="text-xs font-medium text-alert-600">{error}</p>}
    </fieldset>
  )
}
