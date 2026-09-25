import { BookOpen, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { FormFeedback } from '@/components/auth/FormFeedback'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { extractErrorMessage } from '@/lib/api'
import { cadastrarMateria, listarMaterias } from '@/lib/materiaService'
import type { Materia, NovaMateriaPayload } from '@/types/materia'

const INITIAL_VALUES: NovaMateriaPayload = {
  nome: '',
  descricao: '',
  area: '',
}

export function AdminMateriasPage() {
  const [values, setValues] = useState<NovaMateriaPayload>(INITIAL_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [materias, setMaterias] = useState<Materia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  function carregarMaterias() {
    setIsLoading(true)
    setLoadError(null)
    listarMaterias()
      .then(setMaterias)
      .catch(() => setLoadError('Não foi possível carregar as matérias.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    carregarMaterias()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    if (!values.nome.trim()) {
      setSubmitError('Informe o nome da matéria.')
      return
    }

    setIsSubmitting(true)
    try {
      await cadastrarMateria({
        nome: values.nome.trim(),
        descricao: values.descricao.trim(),
        area: values.area.trim(),
      })
      setSubmitSuccess(true)
      setValues(INITIAL_VALUES)
      carregarMaterias()
    } catch (error) {
      setSubmitError(extractErrorMessage(error, 'Não foi possível cadastrar a matéria.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="label-mono text-paper-600 dark:text-zinc-400">Administração</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Cadastro de Matérias
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
            Adicione novas matérias para que os professores possam selecioná-las em seus perfis.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mb-10 flex flex-col gap-5">
          {submitSuccess && <FormFeedback message="Matéria cadastrada com sucesso!" />}
          {submitError && <FormFeedback variant="error" message={submitError} />}

          <Input
            label="Nome"
            type="text"
            placeholder="Ex: Matemática"
            icon={<BookOpen className="size-4" />}
            value={values.nome}
            onChange={(event) => setValues((prev) => ({ ...prev, nome: event.target.value }))}
          />

          <Input
            label="Área"
            type="text"
            placeholder="Ex: Exatas"
            value={values.area}
            onChange={(event) => setValues((prev) => ({ ...prev, area: event.target.value }))}
          />

          <Input
            label="Descrição"
            type="text"
            placeholder="Breve descrição da matéria"
            value={values.descricao}
            onChange={(event) => setValues((prev) => ({ ...prev, descricao: event.target.value }))}
          />

          <div>
            <Button
              type="submit"
              isLoading={isSubmitting}
              fullWidth={false}
              className="min-w-[180px]"
            >
              {isSubmitting ? 'Cadastrando…' : 'Cadastrar Matéria'}
            </Button>
          </div>
        </form>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink-900 dark:text-white">
            Matérias cadastradas
          </h2>

          {isLoading && (
            <p className="inline-flex items-center gap-2 text-sm text-paper-500 dark:text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Carregando matérias…
            </p>
          )}

          {loadError && <FormFeedback variant="error" message={loadError} />}

          {!isLoading && !loadError && materias.length === 0 && (
            <p className="text-sm text-ink-600 dark:text-zinc-400">
              Nenhuma matéria cadastrada ainda.
            </p>
          )}

          {!isLoading && materias.length > 0 && (
            <ul className="flex flex-col gap-2">
              {materias.map((materia) => (
                <li
                  key={materia.id}
                  className="inset-well flex items-center justify-between rounded-md px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-white">
                      {materia.nome}
                    </p>
                    {materia.area && (
                      <p className="text-xs text-ink-600 dark:text-zinc-400">{materia.area}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to="/"
          className="mt-8 inline-block text-sm text-ink-600 dark:text-zinc-400 transition-colors hover:text-ink-900 dark:hover:text-white"
        >
          Voltar ao início
        </Link>
      </main>

      <SiteFooter />
    </div>
  )
}
