import type { FormEvent } from 'react'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'

type ContactInfo = {
  icon: typeof Mail
  label: string
}

const CONTACT_INFOS: ContactInfo[] = [
  { icon: Mail, label: 'contato@conectapro.com.br' },
  { icon: Phone, label: '(11) 99999-9999' },
  { icon: MapPin, label: 'Brasil - SP' },
]

function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
}

export function ContactSection() {
  return (
    <section className="border-t border-paper-200 bg-paper-50 transition-colors duration-300 dark:border-white/10 dark:bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="label-mono text-ink-600 dark:text-zinc-500">Para Professores</span>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                Pronto para transformar o <span className="text-ocre-400">ensino</span>?
              </h2>
              <p className="max-w-md leading-relaxed text-ink-700 dark:text-zinc-400">
                Cadastre-se agora por tempo LIMITADO e ganhe 1 mês de teste totalmente gratuito na
                plataforma. Conecte-se com novos alunos, gerencie sua grade de horários e aumente
                sua renda dando aulas particulares.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {CONTACT_INFOS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocre-100 text-ocre-500 dark:bg-ocre-400/10">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm text-ink-700 dark:text-zinc-400">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-paper-200 bg-white p-8 shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_48px_-12px_rgba(0,0,0,0.7)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-medium uppercase tracking-wide text-ink-800 dark:text-zinc-400"
                >
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="w-full rounded-lg border border-paper-300 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 outline-none transition-all focus:border-ocre-400 focus:ring-1 focus:ring-ocre-400/40 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/30 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wide text-ink-800 dark:text-zinc-400"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-lg border border-paper-300 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 outline-none transition-all focus:border-ocre-400 focus:ring-1 focus:ring-ocre-400/40 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/30 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="subject"
                  className="text-xs font-medium uppercase tracking-wide text-ink-800 dark:text-zinc-400"
                >
                  Área de Atuação / Disciplina
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Ex: Matemática, Inglês, Programação..."
                  required
                  className="w-full rounded-lg border border-paper-300 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 outline-none transition-all focus:border-ocre-400 focus:ring-1 focus:ring-ocre-400/40 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/30 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-xs font-medium uppercase tracking-wide text-ink-800 dark:text-zinc-400"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Conte-nos um pouco sobre a sua experiência e metodologia de ensino..."
                  required
                  className="w-full resize-none rounded-lg border border-paper-300 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 outline-none transition-all focus:border-ocre-400 focus:ring-1 focus:ring-ocre-400/40 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/30 dark:focus:ring-white/10"
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-ocre-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ocre-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-400"
              >
                Garantir meu mês grátis
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
