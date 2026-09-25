import { Reveal } from '@/components/motion/Reveal'

type TeamMember = {
  name: string
  role: string
  description: string
  avatar: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Allan Guedes',
    role: 'Frontend & UI/UX',
    description:
      'Estudante de Engenharia de Software, focado na arquitetura Frontend, UI/UX e no desenvolvimento de interfaces escaláveis para otimizar a experiência do usuário.',
    avatar: '/Img/Allan.png',
  },
  {
    name: 'Henrique',
    role: 'Backend & Banco de Dados',
    description:
      'Estudante de Engenharia de Software, responsável pela estruturação do banco de dados, arquitetura Backend em Spring Boot e lógica de negócios.',
    avatar: '/Img/Henrique.png',
  },
  {
    name: 'Victor',
    role: 'Full-Stack & Integração',
    description:
      'Estudante de Engenharia de Software, focado no desenvolvimento Full-Stack e em garantir a integração fluida entre a interface e os serviços da plataforma.',
    avatar: '/Img/Victor.png',
  },
]

export function TeamSection() {
  return (
    <section className="border-t border-paper-200 transition-colors duration-300 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-zinc-600">
              Nossa Equipe
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
              Quem está por trás do ConectaPro
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.1}>
              <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-paper-200 transition-all duration-300 dark:bg-white/[0.03] dark:ring-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_40px_-12px_rgba(0,0,0,0.6)]">
                <img
                  src={member.avatar}
                  alt={`Foto de ${member.name}`}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
                />
                <h3 className="text-lg font-semibold text-ink-900 dark:text-white">
                  {member.name}
                </h3>
                <span className="mt-1 text-xs font-medium uppercase tracking-wide text-ocre-500">
                  {member.role}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-zinc-400">
                  {member.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
