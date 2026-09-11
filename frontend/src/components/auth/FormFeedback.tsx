import { CheckCircle2, CircleAlert } from 'lucide-react'

type FormFeedbackProps = {
  message: string
  variant?: 'success' | 'error'
}

export function FormFeedback({ message, variant = 'success' }: FormFeedbackProps) {
  if (variant === 'error') {
    return (
      <div className="flex items-start gap-2.5 rounded-md border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-[inset_0_1px_0_#fff]">
        <CircleAlert className="mt-0.5 size-4 shrink-0" />
        {message}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5 rounded-md border border-sage-600/20 bg-sage-50 px-4 py-3 text-sm text-sage-600 shadow-[inset_0_1px_0_#fff]">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  )
}
