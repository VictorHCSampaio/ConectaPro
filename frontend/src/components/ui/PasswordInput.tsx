import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/Input'

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function PasswordInput({ label, error, id, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Input
      id={id}
      label={label}
      error={error}
      type={isVisible ? 'text' : 'password'}
      icon={<Lock className="size-4" />}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
}
