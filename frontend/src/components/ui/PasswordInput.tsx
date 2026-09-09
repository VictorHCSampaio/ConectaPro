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
          className="rounded-sm p-2 text-paper-500 transition-colors hover:text-ocre-500 focus-visible:outline-2 focus-visible:outline-ocre-500"
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
}
