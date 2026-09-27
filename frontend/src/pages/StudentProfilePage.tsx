import { Loader2, MapPin, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { FormSection } from '@/components/teacher-config/FormSection'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import {
  buscarEnderecoPorCep,
  buscarMeuEndereco,
  salvarMeuEndereco,
  type EnderecoPayload,
} from '@/lib/enderecoService'
import { maskCep } from '@/lib/masks'

const VAZIO: EnderecoPayload = {
  cep: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
}

export function StudentProfilePage() {
  const { user } = useAuth()

  const [form, setForm] = useState<EnderecoPayload>(VAZIO)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    buscarMeuEndereco()
      .then((endereco) => {
        if (isActive && endereco) {
          setForm({ ...endereco, cep: maskCep(endereco.cep ?? '') })
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const buscarCep = useCallback(async (digitos: string) => {
    setCepLoading(true)
    setCepError(null)

    try {
      const endereco = await buscarEnderecoPorCep(digitos)
      setForm((prev) => ({
        ...prev,
        street: endereco.street,
        neighborhood: endereco.neighborhood,
        city: endereco.city,
        state: endereco.state,
      }))
    } catch (error) {
      setCepError(extractErrorMessage(error, 'Não foi possível buscar esse CEP.'))
    } finally {
      setCepLoading(false)
    }
  }, [])

  function handleCepChange(raw: string) {
    const masked = maskCep(raw)
    setForm((prev) => ({ ...prev, cep: masked }))
    setCepError(null)
    setFeedback(null)

    if (masked.replace(/\D/g, '').length === 8) buscarCep(masked.replace(/\D/g, ''))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const digitos = form.cep.replace(/\D/g, '')
    if (digitos.length !== 8) {
      setCepError('Informe um CEP com 8 dígitos.')
      return
    }

    setIsSaving(true)
    setFeedback(null)

    try {
      await salvarMeuEndereco({ ...form, cep: digitos })
      setFeedback('Endereço salvo. A distância até cada professor já usa ele.')
    } catch (error) {
      setCepError(extractErrorMessage(error, 'Não foi possível salvar o endereço.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <p className="label-mono text-paper-600 dark:text-zinc-500">Conta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Meu perfil
        </h1>
        <p className="mt-2 text-sm text-ink-600 dark:text-zinc-400">
          {user?.name} · {user?.email}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <FormSection
            title="Meu endereço"
            description="Informe seu CEP para ver a distância até cada professor na busca."
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
                <Loader2 className="size-4 animate-spin" />
                Carregando…
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <Input
                    label="CEP"
                    type="text"
                    placeholder="00000-000"
                    inputMode="numeric"
                    icon={<MapPin className="size-4" />}
                    value={form.cep}
                    error={cepError ?? undefined}
                    onChange={(event) => handleCepChange(event.target.value)}
                    trailing={
                      cepLoading ? (
                        <span className="flex items-center pr-1">
                          <Loader2 className="size-4 animate-spin text-paper-400 dark:text-zinc-600" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label="Buscar CEP"
                          onClick={() => {
                            const digitos = form.cep.replace(/\D/g, '')
                            if (digitos.length === 8) buscarCep(digitos)
                          }}
                          className="flex items-center px-2 text-paper-500 transition-colors hover:text-ink-800 dark:text-zinc-500 dark:hover:text-white"
                        >
                          <Search className="size-4" />
                        </button>
                      )
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Logradouro" value={form.street ?? ''} readOnly />
                  <Input label="Bairro" value={form.neighborhood ?? ''} readOnly />
                  <Input label="Cidade" value={form.city ?? ''} readOnly />
                  <Input label="Estado" value={form.state ?? ''} readOnly />
                </div>

                <p className="text-xs text-paper-500 dark:text-zinc-600">
                  Preenchemos o endereço a partir do CEP. Ele fica visível apenas para você.
                </p>
              </div>
            )}
          </FormSection>

          {feedback && (
            <p className="text-sm font-medium text-sage-600 dark:text-emerald-400">{feedback}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" fullWidth={false} isLoading={isSaving} className="px-8">
              Salvar endereço
            </Button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  )
}
