import { Loader2, MapPin, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { AvatarUpload } from '@/components/teacher-config/AvatarUpload'
import { FormSection } from '@/components/teacher-config/FormSection'
import { Button } from '@/components/ui/Button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Input } from '@/components/ui/Input'
import { LgpdSection } from '@/components/ui/LgpdSection'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import {
  buscarEnderecoPorCep,
  buscarMeuEndereco,
  salvarMeuEndereco,
  type EnderecoPayload,
} from '@/lib/enderecoService'
import { maskCep } from '@/lib/masks'
import { chaveUsuarioCache, gravarPerfilAluno, lerPerfilAluno } from '@/lib/perfilCache'
import { buscarMeuPerfilAluno, salvarMeuPerfilAluno, type PerfilAluno } from '@/lib/usuarioService'

const ENDERECO_VAZIO: EnderecoPayload = {
  cep: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
}

function estadoInicialAluno() {
  const cache = lerPerfilAluno(chaveUsuarioCache())
  return {
    temCache: cache != null,
    biografia: cache?.perfil.biografia ?? '',
    avatar: cache?.perfil.avatarUrl ?? null,
    endereco: cache?.endereco
      ? { ...cache.endereco, cep: maskCep(cache.endereco.cep ?? '') }
      : ENDERECO_VAZIO,
  }
}

export function StudentProfilePage() {
  const { user, updateUser } = useAuth()
  const [inicial] = useState(() => estadoInicialAluno())

  const [biografia, setBiografia] = useState(inicial.biografia)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(inicial.avatar)

  const [endereco, setEndereco] = useState<EnderecoPayload>(inicial.endereco)
  const [isLoading, setIsLoading] = useState(!inicial.temCache)
  const [isSaving, setIsSaving] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    Promise.all([buscarMeuPerfilAluno(), buscarMeuEndereco()])
      .then(([perfil, end]) => {
        if (!isActive) {
          return
        }
        const enderecoCarregado = end ? { ...end, cep: maskCep(end.cep ?? '') } : null
        setBiografia((atual) => (atual === inicial.biografia ? (perfil.biografia ?? '') : atual))
        setAvatarPreviewUrl((atual) =>
          atual === inicial.avatar ? (perfil.avatarUrl ?? null) : atual,
        )
        if (enderecoCarregado) {
          setEndereco((atual) => {
            const intacto =
              atual.cep === inicial.endereco.cep &&
              atual.street === inicial.endereco.street &&
              atual.neighborhood === inicial.endereco.neighborhood &&
              atual.city === inicial.endereco.city &&
              atual.state === inicial.endereco.state
            return intacto ? enderecoCarregado : atual
          })
        }
        gravarPerfilAluno(chaveUsuarioCache(), {
          perfil,
          endereco: enderecoCarregado,
        })
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [inicial])

  const buscarCep = useCallback(async (digitos: string) => {
    setCepLoading(true)
    setCepError(null)

    try {
      const end = await buscarEnderecoPorCep(digitos)
      setEndereco((prev) => ({
        ...prev,
        street: end.street,
        neighborhood: end.neighborhood,
        city: end.city,
        state: end.state,
      }))
    } catch (err) {
      setCepError(extractErrorMessage(err, 'Não foi possível buscar esse CEP.'))
    } finally {
      setCepLoading(false)
    }
  }, [])

  function handleCepChange(raw: string) {
    const masked = maskCep(raw)
    setEndereco((prev) => ({ ...prev, cep: masked }))
    setCepError(null)
    setFeedback(null)

    if (masked.replace(/\D/g, '').length === 8) buscarCep(masked.replace(/\D/g, ''))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setFeedback(null)
    setError(null)

    try {
      const salvo: PerfilAluno = await salvarMeuPerfilAluno({
        biografia: biografia.trim(),
        avatarUrl: avatarPreviewUrl ?? undefined,
      })

      const digitos = endereco.cep.replace(/\D/g, '')
      let enderecoSalvo: EnderecoPayload | null = endereco
      if (digitos.length === 8) {
        const salvoEndereco = await salvarMeuEndereco({ ...endereco, cep: digitos })
        enderecoSalvo = { ...salvoEndereco, cep: maskCep(salvoEndereco.cep ?? '') }
        setEndereco(enderecoSalvo)
      }

      gravarPerfilAluno(chaveUsuarioCache(), { perfil: salvo, endereco: enderecoSalvo })
      updateUser({ avatarUrl: avatarPreviewUrl })
      setFeedback('Perfil salvo com sucesso!')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar o perfil.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={user?.name}
            src={avatarPreviewUrl ?? user?.avatarUrl}
            className="size-20 border border-paper-300 text-lg dark:border-white/15"
          />
          <div className="min-w-0">
            <p className="label-mono text-paper-600 dark:text-zinc-500">Conta</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
              Meu perfil
            </h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-zinc-400">
              {user?.name} · {user?.email}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
            <Loader2 className="size-4 animate-spin" />
            Carregando…
          </div>
        ) : (
          <>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <FormSection title="Sobre mim" description="Informações visíveis no seu perfil público.">
              <div className="flex flex-col gap-5">
                <div>
                  <span className="mb-2 block text-xs font-medium text-paper-600 dark:text-zinc-400">
                    Foto de perfil
                  </span>
                  <AvatarUpload
                    previewUrl={avatarPreviewUrl}
                    onFileSelect={(_file, url) => setAvatarPreviewUrl(url)}
                    onRemove={() => setAvatarPreviewUrl(null)}
                  />
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-xs font-medium text-paper-600 dark:text-zinc-400">
                    Biografia
                  </span>
                  <textarea
                    value={biografia}
                    onChange={(e) => setBiografia(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Conte um pouco sobre você, seus interesses e objetivos."
                    className="inset-well w-full resize-y rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 focus:border-ocre-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                  />
                  <span className="self-end text-xs tabular-nums text-paper-400 dark:text-zinc-600">
                    {biografia.length}/1000
                  </span>
                </label>
              </div>
            </FormSection>

            <FormSection
              title="Meu endereço"
              description="Informe seu CEP para ver a distância até cada professor na busca."
            >
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <Input
                    label="CEP"
                    type="text"
                    placeholder="00000-000"
                    inputMode="numeric"
                    icon={<MapPin className="size-4" />}
                    value={endereco.cep}
                    error={cepError ?? undefined}
                    onChange={(e) => handleCepChange(e.target.value)}
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
                            const digitos = endereco.cep.replace(/\D/g, '')
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
                  <Input label="Logradouro" value={endereco.street ?? ''} readOnly />
                  <Input label="Bairro" value={endereco.neighborhood ?? ''} readOnly />
                  <Input label="Cidade" value={endereco.city ?? ''} readOnly />
                  <Input label="Estado" value={endereco.state ?? ''} readOnly />
                </div>

                <p className="text-xs text-paper-500 dark:text-zinc-600">
                  Preenchemos o endereço a partir do CEP. Ele fica visível apenas para você.
                </p>
              </div>
            </FormSection>

            {error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}
            {feedback && (
              <p className="text-sm font-medium text-sage-600 dark:text-emerald-400">{feedback}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" fullWidth={false} isLoading={isSaving} className="px-8">
                Salvar perfil
              </Button>
            </div>
          </form>

          <LgpdSection />
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
