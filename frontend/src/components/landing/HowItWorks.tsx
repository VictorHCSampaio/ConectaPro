const STEPS = [
  {
    number: 1,
    title: 'Busque',
    description: 'Pesquise por matéria e localização para achar profissionais perto de você.',
  },
  {
    number: 2,
    title: 'Compare',
    description: 'Veja formação, experiência, modalidades e valores de cada professor.',
  },
  {
    number: 3,
    title: 'Conecte',
    description: 'Escolha o professor ideal e entre em contato para começar as aulas.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Como funciona
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-glow-brand"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
              {step.number}
            </div>
            <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
