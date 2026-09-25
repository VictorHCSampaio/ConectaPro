import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { AvatarUpload } from '@/components/teacher-config/AvatarUpload'
import { AvailabilityGrid } from '@/components/teacher-config/AvailabilityGrid'
import { FormSection } from '@/components/teacher-config/FormSection'
import { SubjectExperienceInput } from '@/components/teacher-config/SubjectExperienceInput'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Radio } from '@/components/ui/Radio'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { buscarPerfilProfessor, salvarPerfilProfessor } from '@/lib/teacherProfileService'
import type {
  ApiModality,
  ApiTeachingModel,
  TeacherAddress,
  TeacherProfileErrors,
  TeacherProfileFormData,
  TeacherProfilePayload,
  TeachingModel,
  ViaCepResponse,
  WeekDay,
  HourSlot,
  ShiftSlot,
} from '@/types/teacher-profile'

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, '($1')
  if (digits.length <= 7) return digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

function maskCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function formatCurrency(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '')
  if (!digits) return ''
  const cents = parseInt(digits, 10)
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatCurrencyFromFloat(value: number): string {
  return formatCurrency(String(Math.round(value * 100)))
}

function parseCurrencyToFloat(formatted: string): number {
  const digits = formatted.replace(/\D/g, '')
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

const BIO_MIN = 50
const BIO_MAX = 500

function validateProfile(data: TeacherProfileFormData): TeacherProfileErrors {
  const errors: TeacherProfileErrors = {}

  if (!data.fullName.trim()) {
    errors.fullName = 'Nome completo é obrigatório'
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Nome deve ter no mínimo 3 caracteres'
  }

  const phoneDigits = data.phone.replace(/\D/g, '')
  if (!phoneDigits) {
    errors.phone = 'Telefone é obrigatório'
  } else if (phoneDigits.length < 11) {
    errors.phone = 'Informe um telefone válido: (XX) XXXXX-XXXX'
  }

  const bioLength = data.bio.trim().length
  if (!bioLength) {
    errors.bio = 'Biografia é obrigatória'
  } else if (bioLength < BIO_MIN) {
    errors.bio = `Mínimo ${BIO_MIN} caracteres (faltam ${BIO_MIN - bioLength})`
  }

  if (data.subjects.length === 0) {
    errors.subjects = 'Adicione ao menos uma matéria'
  }

  if (!parseCurrencyToFloat(data.pricePerHour)) {
    errors.pricePerHour = 'Informe um valor por aula'
  }

  const cepDigits = data.address.cep.replace(/\D/g, '')
  if (!cepDigits) {
    errors.cep = 'CEP é obrigatório'
  } else if (cepDigits.length !== 8) {
    errors.cep = 'CEP inválido — deve ter 8 dígitos'
  }

  return errors
}

const MODALITY_MAP: Record<string, ApiModality> = {
  online: 'ONLINE',
  presencial: 'PRESENCIAL',
}

const TEACHING_MODEL_MAP: Record<string, ApiTeachingModel> = {
  particulares: 'PARTICULARES',
  instituicoes: 'INSTITUICOES',
}

function buildPayload(data: TeacherProfileFormData): TeacherProfilePayload {
  return {
    fullName: data.fullName.trim(),
    phone: data.phone,
    bio: data.bio.trim(),
    subjects: data.subjects,
    teachingModel: data.teachingModel ? TEACHING_MODEL_MAP[data.teachingModel] : null,
    modality: MODALITY_MAP[data.modality],
    pricePerHour: parseCurrencyToFloat(data.pricePerHour),
    address: {
      cep: data.address.cep.replace(/\D/g, ''),
      street: data.address.logradouro,
      neighborhood: data.address.bairro,
      city: data.address.cidade,
      state: data.address.estado,
    },
    availability: [...data.availability].map((key) => {
      const idx = key.indexOf('-')
      const day = key.slice(0, idx) as WeekDay
      const time = key.slice(idx + 1) as HourSlot | ShiftSlot
      return { day, time }
    }),
  }
}

const INITIAL_ADDRESS: TeacherAddress = {
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
}

const INITIAL_FORM: TeacherProfileFormData = {
  avatarFile: null,
  avatarPreviewUrl: null,
  fullName: '',
  phone: '',
  bio: '',
  subjects: [],
  teachingModel: '',
  modality: 'online',
  pricePerHour: '',
  address: INITIAL_ADDRESS,
  availability: new Set(),
}

const TEACHING_MODEL_FROM_API: Record<ApiTeachingModel, TeachingModel> = {
  PARTICULARES: 'particulares',
  INSTITUICOES: 'instituicoes',
}

function buildFormFromPayload(payload: TeacherProfilePayload): TeacherProfileFormData {
  return {
    avatarFile: null,
    avatarPreviewUrl: null,
    fullName: payload.fullName ?? '',
    phone: maskPhone(payload.phone ?? ''),
    bio: payload.bio ?? '',
    subjects: payload.subjects ?? [],
    teachingModel: payload.teachingModel ? TEACHING_MODEL_FROM_API[payload.teachingModel] : '',
    modality: payload.modality === 'PRESENCIAL' ? 'presencial' : 'online',
    pricePerHour: payload.pricePerHour ? formatCurrencyFromFloat(payload.pricePerHour) : '',
    address: {
      cep: maskCep(payload.address?.cep ?? ''),
      logradouro: payload.address?.street ?? '',
      bairro: payload.address?.neighborhood ?? '',
      cidade: payload.address?.city ?? '',
      estado: payload.address?.state ?? '',
    },
    availability: new Set((payload.availability ?? []).map((slot) => `${slot.day}-${slot.time}`)),
  }
}

type TextareaFieldProps = {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  maxLength?: number
  rows?: number
  placeholder?: string
}

function TextareaField({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  maxLength = BIO_MAX,
  rows = 5,
  placeholder,
}: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <label htmlFor={id} className="label-mono text-paper-600 dark:text-zinc-400">
          {label}
        </label>
        <span
          className={cn(
            'tnum text-xs tabular-nums transition-colors',
            value.length > maxLength * 0.9
              ? 'text-alert-600 dark:text-alert-200'
              : 'text-paper-400 dark:text-zinc-600',
          )}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'inset-well w-full resize-y rounded-md px-4 py-3 text-sm text-ink-900 dark:text-white placeholder:text-paper-400',
          'transition-[border-color,box-shadow] duration-200 focus:outline-none',
          error
            ? 'border-alert-600/50 focus:border-alert-600'
            : 'hover:border-paper-400 dark:hover:border-white/20 focus:border-ocre-400 focus:shadow-[inset_0_2px_4px_rgba(18,38,63,0.09),0_0_0_3px_rgba(192,161,74,0.18)]',
        )}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-alert-600 dark:text-alert-200"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      key="toast"
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
      className="fixed right-4 top-20 z-50 flex items-center gap-3 rounded-lg border border-sage-600/30 bg-sage-50 dark:bg-emerald-900/30 px-5 py-3.5 shadow-[0_8px_24px_-8px_rgba(59,86,54,0.28)] sm:right-6"
    >
      <CheckCircle2 className="size-5 shrink-0 text-sage-600 dark:text-emerald-400" />
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-sage-600 dark:text-emerald-400">
          Perfil atualizado!
        </p>
        <p className="text-xs text-sage-600/70">Suas informações foram salvas com sucesso.</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className="ml-2 text-sage-600/50 transition-colors hover:text-sage-600 dark:hover:text-emerald-400"
      >
        ✕
      </button>
    </motion.div>
  )
}

export function TeacherProfileConfigPage() {
  const bioId = useId()
  const prevAvatarUrlRef = useRef<string | null>(null)
  const { user } = useAuth()

  const [form, setForm] = useState<TeacherProfileFormData>(() => ({
    ...INITIAL_FORM,
    fullName: user?.name ?? '',
    availability: new Set(INITIAL_FORM.availability),
  }))
  const [errors, setErrors] = useState<TeacherProfileErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof TeacherProfileErrors, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [cepLoading, setCepLoading] = useState(false)
  const [cepFetchError, setCepFetchError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    buscarPerfilProfessor()
      .then((profile) => {
        if (isActive && profile) {
          setForm(buildFormFromPayload(profile))
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  function setAddressField(key: keyof TeacherAddress, value: string) {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }))
  }

  function touch(field: keyof TeacherProfileErrors) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function fieldError(field: keyof TeacherProfileErrors): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function revalidate(next: TeacherProfileFormData) {
    setErrors(validateProfile(next))
  }

  function handleAvatarSelect(file: File, previewUrl: string) {
    if (prevAvatarUrlRef.current) URL.revokeObjectURL(prevAvatarUrlRef.current)
    prevAvatarUrlRef.current = previewUrl
    const next = { ...form, avatarFile: file, avatarPreviewUrl: previewUrl }
    setForm(next)
  }

  function handleAvatarRemove() {
    if (prevAvatarUrlRef.current) URL.revokeObjectURL(prevAvatarUrlRef.current)
    prevAvatarUrlRef.current = null
    const next = { ...form, avatarFile: null, avatarPreviewUrl: null }
    setForm(next)
  }

  function handlePhoneChange(raw: string) {
    const masked = maskPhone(raw)
    const next = { ...form, phone: masked }
    setForm(next)
    revalidate(next)
  }

  function handleCepChange(raw: string) {
    const masked = maskCep(raw)
    const next: TeacherProfileFormData = {
      ...form,
      address: { ...form.address, cep: masked },
    }
    setForm(next)
    revalidate(next)
    setCepFetchError(null)

    const digits = masked.replace(/\D/g, '')
    if (digits.length === 8) fetchViaCep(digits)
  }

  const fetchViaCep = useCallback(async (cepDigits: string) => {
    setCepLoading(true)
    setCepFetchError(null)

    try {
      const { data } = await axios.get<ViaCepResponse>(
        `https://viacep.com.br/ws/${cepDigits}/json/`,
      )

      if (data.erro) {
        setCepFetchError('CEP não encontrado. Verifique e tente novamente.')
        return
      }

      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        },
      }))
    } catch {
      setCepFetchError('Falha ao buscar o CEP. Verifique sua conexão.')
    } finally {
      setCepLoading(false)
    }
  }, [])

  function handleCepBlur() {
    touch('cep')
    const digits = form.address.cep.replace(/\D/g, '')
    if (digits.length === 8) fetchViaCep(digits)
  }

  function handlePriceChange(raw: string) {
    const formatted = formatCurrency(raw)
    const next = { ...form, pricePerHour: formatted }
    setForm(next)
    revalidate(next)
  }

  function handleSubjectsChange(subjects: TeacherProfileFormData['subjects']) {
    const next = { ...form, subjects }
    setForm(next)
    revalidate(next)
  }

  function toggleAvailability(key: string) {
    const next = new Set(form.availability)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setForm((prev) => ({ ...prev, availability: next }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    const currentErrors = validateProfile(form)
    setErrors(currentErrors)

    if (Object.keys(currentErrors).length > 0) {
      const firstErrorEl = document.querySelector('[aria-invalid="true"]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const saved = await salvarPerfilProfessor(buildPayload(form))
      setForm(buildFormFromPayload(saved))

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, 'Não foi possível salvar seu perfil. Tente novamente.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <AnimatePresence>
        {showSuccess && <SuccessToast onDismiss={() => setShowSuccess(false)} />}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-paper-500 dark:text-zinc-500 transition-colors hover:text-ink-800 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>

          <p className="label-mono text-paper-600 dark:text-zinc-400">Conta</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Configurar Perfil
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
            Mantenha seus dados atualizados para aparecer nos resultados de busca.
          </p>

          {isLoading && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-paper-500 dark:text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Carregando seus dados…
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FormSection
            title="Foto de Perfil"
            description="Uma boa foto aumenta a confiança dos alunos."
          >
            <AvatarUpload
              previewUrl={form.avatarPreviewUrl}
              onFileSelect={handleAvatarSelect}
              onRemove={handleAvatarRemove}
            />
          </FormSection>

          <FormSection title="Dados Pessoais" description="Informações de contato e apresentação.">
            <div className="flex flex-col gap-5">
              <Input
                label="Nome Completo"
                type="text"
                placeholder="Ex: Maria Eduarda Oliveira"
                icon={<User className="size-4" />}
                value={form.fullName}
                autoComplete="name"
                error={fieldError('fullName')}
                onChange={(e) => {
                  const next = { ...form, fullName: e.target.value }
                  setForm(next)
                  revalidate(next)
                }}
                onBlur={() => touch('fullName')}
              />

              <Input
                label="Telefone / WhatsApp"
                type="tel"
                placeholder="(11) 98765-4321"
                icon={<Phone className="size-4" />}
                value={form.phone}
                autoComplete="tel"
                inputMode="numeric"
                error={fieldError('phone')}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => touch('phone')}
              />

              <TextareaField
                id={bioId}
                label="Biografia / Sobre Mim"
                placeholder="Apresente-se: sua formação, experiência, metodologia de ensino e o que te diferencia como professor..."
                value={form.bio}
                maxLength={BIO_MAX}
                rows={6}
                error={fieldError('bio')}
                onChange={(value) => {
                  const next = { ...form, bio: value }
                  setForm(next)
                  revalidate(next)
                }}
                onBlur={() => touch('bio')}
              />
            </div>
          </FormSection>

          <FormSection
            title="Informações Didáticas"
            description="O que, como e por quanto você ensina."
          >
            <div className="flex flex-col gap-6">
              <SubjectExperienceInput
                subjects={form.subjects}
                onChange={handleSubjectsChange}
                error={fieldError('subjects')}
              />

              <div className="flex flex-col gap-2">
                <span className="label-mono text-paper-600 dark:text-zinc-400">
                  Modelo de Lecionamento
                </span>
                <div className="flex flex-col gap-3">
                  {(
                    [
                      {
                        value: 'particulares',
                        label: 'Aulas particulares',
                      },
                      {
                        value: 'instituicoes',
                        label: 'Aulas para instituições de ensino (escolas e/ou faculdades)',
                      },
                    ] as const
                  ).map(({ value, label }) => (
                    <Radio
                      key={value}
                      name="teachingModel"
                      value={value}
                      label={label}
                      checked={form.teachingModel === value}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          teachingModel: value,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {form.teachingModel !== '' && (
                  <motion.div
                    key="modality-block"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex flex-col gap-2">
                      <span className="label-mono text-paper-600 dark:text-zinc-400">
                        Modalidade de Ensino
                      </span>
                      <div className="flex flex-wrap gap-4">
                        {(
                          [
                            { value: 'online', label: 'Online' },
                            { value: 'presencial', label: 'Presencial' },
                          ] as const
                        ).map(({ value, label }) => (
                          <Radio
                            key={value}
                            name="modality"
                            value={value}
                            label={label}
                            checked={form.modality === value}
                            onChange={() => {
                              setForm((prev) => ({
                                ...prev,
                                modality: value,
                                availability: new Set(),
                              }))
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Valor da Hora/Aula"
                type="text"
                placeholder="R$ 0,00"
                inputMode="numeric"
                icon={<DollarSign className="size-4" />}
                value={form.pricePerHour}
                error={fieldError('pricePerHour')}
                onChange={(e) => handlePriceChange(e.target.value)}
                onBlur={() => touch('pricePerHour')}
              />
            </div>
          </FormSection>

          <FormSection
            title="Localização"
            description="Informe o CEP para preenchermos o endereço automaticamente."
          >
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Input
                    label="CEP"
                    type="text"
                    placeholder="00000-000"
                    inputMode="numeric"
                    icon={<MapPin className="size-4" />}
                    value={form.address.cep}
                    error={fieldError('cep') ?? cepFetchError ?? undefined}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={handleCepBlur}
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
                            const digits = form.address.cep.replace(/\D/g, '')
                            if (digits.length === 8) fetchViaCep(digits)
                          }}
                          className="flex size-8 items-center justify-center rounded-md text-paper-400 dark:text-zinc-600 transition-colors hover:bg-paper-100 dark:hover:bg-white/5 hover:text-ink-700 dark:hover:text-zinc-300"
                        >
                          <Search className="size-4" />
                        </button>
                      )
                    }
                  />
                </div>

                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-end whitespace-nowrap rounded-md border border-paper-300 dark:border-white/10 bg-white dark:bg-night-700 px-3 py-[11px] text-xs font-medium text-ink-600 dark:text-zinc-400 raised transition-colors hover:border-paper-400 dark:hover:border-white/20 hover:text-ink-900 dark:hover:text-white"
                >
                  Não sei meu CEP
                </a>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Logradouro"
                    type="text"
                    placeholder="Preenchido automaticamente"
                    value={form.address.logradouro}
                    disabled={cepLoading}
                    onChange={(e) => setAddressField('logradouro', e.target.value)}
                  />
                </div>

                <Input
                  label="Bairro"
                  type="text"
                  placeholder="Preenchido automaticamente"
                  value={form.address.bairro}
                  disabled={cepLoading}
                  onChange={(e) => setAddressField('bairro', e.target.value)}
                />

                <Input
                  label="Cidade"
                  type="text"
                  placeholder="Preenchido automaticamente"
                  value={form.address.cidade}
                  disabled={cepLoading}
                  onChange={(e) => setAddressField('cidade', e.target.value)}
                />

                <Input
                  label="Estado (UF)"
                  type="text"
                  placeholder="Ex: SP"
                  value={form.address.estado}
                  disabled={cepLoading}
                  maxLength={2}
                  onChange={(e) => setAddressField('estado', e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Disponibilidade"
            description="Selecione os dias e turnos em que você costuma dar aulas."
          >
            <AvailabilityGrid
              selected={form.availability}
              onToggle={toggleAvailability}
              modality={form.modality}
            />
          </FormSection>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {submitted && Object.keys(errors).length > 0 && (
              <p role="alert" className="text-xs font-medium text-alert-600 dark:text-alert-200">
                Corrija os campos indicados antes de salvar.
              </p>
            )}

            {submitError && (
              <p role="alert" className="text-xs font-medium text-alert-600 dark:text-alert-200">
                {submitError}
              </p>
            )}

            <div className={cn('sm:ml-auto', Object.keys(errors).length === 0 && 'sm:ml-auto')}>
              <Button
                type="submit"
                isLoading={isSubmitting}
                fullWidth={false}
                className="min-w-[180px]"
              >
                {isSubmitting ? 'Salvando…' : 'Salvar Perfil'}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  )
}
