import { CheckCircle2 } from 'lucide-react'

type FormFeedbackProps = {
  message: string
}

export function FormFeedback({ message }: FormFeedbackProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-sage-600/20 bg-sage-50 px-4 py-3 text-sm text-sage-600 shadow-[inset_0_1px_0_#fff]">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  )
}
