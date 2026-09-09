import { Reveal } from '@/components/motion/Reveal'

const STEPS = [
  {
    number: '01',
    title: 'Busque por matéria',
    description: 'Filtre por matéria, modalidade e faixa de valor da hora-aula.',
  },
  {
    number: '02',
    title: 'Compare lado a lado',
    description: 'Formação, experiência, avaliações e preço de cada professor na mesma tela.',
  },
  {
    number: '03',
    title: 'Fale com o professor',
    description: 'Escolha um professor e combine horário e local diretamente com ele.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight text-ink-900">Como funciona</h2>
      </Reveal>

      <ol className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.1}>
            <li className="card h-full rounded-lg p-6">
              <span className="tnum text-sm font-semibold text-ocre-500">{step.number}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.description}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
