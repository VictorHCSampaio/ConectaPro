import { useCallback, useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type AvatarUploadProps = {
  previewUrl: string | null
  name?: string | null
  onFileSelect: (file: File, previewUrl: string) => void
  onRemove: () => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_MB = 5

function fotoValida(src?: string | null): src is string {
  if (typeof src !== 'string') {
    return false
  }
  const valor = src.trim()
  return valor.length > 0 && valor !== 'null' && valor !== 'undefined'
}

function inicial(nome?: string | null) {
  const letra = nome?.trim().charAt(0)
  return letra ? letra.toUpperCase() : '?'
}

export function AvatarUpload({ previewUrl, name, onFileSelect, onRemove }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const foto = fotoValida(previewUrl) ? previewUrl.trim() : null
  const [fotoQuebrada, setFotoQuebrada] = useState<string | null>(null)
  const mostrarFoto = foto != null && fotoQuebrada !== foto

  const processFile = useCallback(
    (file: File) => {
      setSizeError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setSizeError('Formato inválido. Use PNG, JPG ou WEBP.')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setSizeError(`Arquivo muito grande. Máx. ${MAX_SIZE_MB} MB.`)
        return
      }

      const url = URL.createObjectURL(file)
      onFileSelect(file, url)
    },
    [onFileSelect],
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processFile(file)
    event.target.value = ''
  }

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const openFilePicker = () => inputRef.current?.click()

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
      <div
        role="button"
        tabIndex={0}
        aria-label={mostrarFoto ? 'Alterar foto de perfil' : 'Carregar foto de perfil'}
        onClick={openFilePicker}
        onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group relative flex size-28 shrink-0 cursor-pointer select-none items-center justify-center overflow-hidden rounded-full text-xl font-semibold',
          'border-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500',
          isDragging
            ? 'scale-105 border-ocre-400 bg-ocre-100/60'
            : mostrarFoto
              ? 'border-paper-200 dark:border-white/10'
              : 'border-transparent bg-ink-800 text-paper-50 dark:bg-white/10 dark:text-white',
        )}
      >
        {mostrarFoto ? (
          <>
            <img
              src={foto}
              alt=""
              className="size-full object-cover"
              onError={() => setFotoQuebrada(foto)}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink-900/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Camera className="size-5 text-white" />
              <span className="text-[10px] font-semibold text-white">Alterar</span>
            </div>
          </>
        ) : (
          inicial(name)
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        aria-hidden="true"
        onChange={handleInputChange}
      />

      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-semibold text-ink-800 dark:text-zinc-100">Foto de Perfil</p>
        <p className="text-xs leading-relaxed text-paper-500 dark:text-zinc-500">
          PNG, JPG ou WEBP · Máx. {MAX_SIZE_MB} MB.
          <br />
          Clique no círculo ou arraste sua foto até ele.
        </p>

        {sizeError && (
          <p role="alert" className="text-xs font-medium text-alert-600 dark:text-alert-200">
            {sizeError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-md border border-paper-300 dark:border-white/10 bg-white dark:bg-night-700 px-3 py-1.5 text-xs font-semibold text-ink-800 dark:text-zinc-100 raised transition-transform duration-150 hover:border-paper-400 dark:hover:border-white/20 active:translate-y-0.5 active:shadow-none"
          >
            {foto ? 'Trocar foto' : 'Escolher foto'}
          </button>

          {foto && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-alert-600 dark:text-alert-200 transition-colors hover:text-alert-600/75"
            >
              <Trash2 className="size-3" />
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
