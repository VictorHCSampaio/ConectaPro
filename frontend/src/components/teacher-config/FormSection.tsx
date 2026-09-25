import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="card rounded-lg overflow-hidden">
      <div className="border-b border-paper-200 dark:border-white/10 px-6 py-5 sm:px-8">
        <h2 className="text-base font-semibold text-ink-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-ink-600 dark:text-zinc-400">{description}</p>
        )}
      </div>

      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  )
}
