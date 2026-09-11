import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

/**
 * Reusable card-shaped section wrapper used inside TeacherProfileConfigPage.
 * Renders a labelled group separated by a divider.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="card rounded-lg overflow-hidden">
      {/* Section header */}
      <div className="border-b border-paper-200 px-6 py-5 sm:px-8">
        <h2 className="text-base font-semibold text-ink-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-600">{description}</p>}
      </div>

      {/* Section body */}
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  )
}
