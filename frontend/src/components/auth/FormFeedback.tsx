import { CheckCircle2 } from 'lucide-react'

type FormFeedbackProps = {
  message: string
}

export function FormFeedback({ message }: FormFeedbackProps) {
  return (
    <div className="animate-fade-up mb-5 flex items-center gap-2.5 rounded-xl border border-growth-200 bg-growth-50 px-4 py-3 text-sm font-medium text-growth-700">
      <CheckCircle2 className="size-5 shrink-0" />
      {message}
    </div>
  )
}
