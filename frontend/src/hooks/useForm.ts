import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type FieldErrors<T> = Partial<Record<keyof T, string>>
type Validate<T> = (values: T) => FieldErrors<T>

export function useForm<T extends Record<string, unknown>>(initialValues: T, validate: Validate<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(() => validate(values), [values, validate])
  const isValid = Object.keys(errors).length === 0

  function setField<K extends keyof T>(field: K, value: T[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function touchField(field: keyof T) {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  function fieldError(field: keyof T) {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function handleSubmit(onValid: (values: T) => void | Promise<void>) {
    return async (event: FormEvent) => {
      event.preventDefault()
      setSubmitted(true)
      if (!isValid) return

      setIsSubmitting(true)
      try {
        await onValid(values)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return { values, setField, touchField, fieldError, handleSubmit, isSubmitting, isValid }
}
