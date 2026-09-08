import { SubjectSearchBar } from '@/components/landing/SubjectSearchBar'
import { TeacherPreviewCard } from '@/components/landing/TeacherPreviewCard'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_120%_100%_at_top,black_40%,transparent_100%)]" />
      <div className="animate-float pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-300/40 blur-3xl" />
      <div className="animate-float-reverse pointer-events-none absolute top-1/2 -left-24 size-72 rounded-full bg-growth-300/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="animate-fade-up flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Encontre o professor particular
            <span className="block text-brand-600">ideal para você</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-slate-600">
            Compare formação, experiência e valores de profissionais qualificados em um só
            lugar.
          </p>
          <SubjectSearchBar />
        </div>

        <div className="flex justify-center lg:justify-end">
          <TeacherPreviewCard />
        </div>
      </div>
    </section>
  )
}
