import { Link } from 'react-router-dom'

type AccentPanelProps = {
  heading: string
  text: string
  ctaLabel: string
  ctaTo: string
}

export function AccentPanel({ heading, text, ctaLabel, ctaTo }: AccentPanelProps) {
  return (
    <div className="relative hidden flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-10 py-12 text-center text-white md:flex">
      <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-growth-400/20 blur-3xl" />

      <div className="relative flex flex-col items-center gap-4">
        <h3 className="text-2xl font-bold tracking-tight text-balance">{heading}</h3>
        <p className="max-w-[26ch] text-sm leading-relaxed text-brand-100">{text}</p>
        <Link
          to={ctaTo}
          className="mt-2 inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}
