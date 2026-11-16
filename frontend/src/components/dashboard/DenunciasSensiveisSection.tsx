import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MOTIVOS_DENUNCIA } from '@/lib/denunciaService'
import type { DenunciaRegistro, PapelUsuario, StatusDenuncia } from '@/lib/denunciaService'

const STATUS_LABEL: Record<StatusDenuncia, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  RESOLVIDA: 'Resolvida',
  ARQUIVADA: 'Arquivada',
  ENCAMINHADA: 'Resolvida / Encaminhada às autoridades',
}

const STATUS_VARIANT: Record<StatusDenuncia, BadgeVariant> = {
  PENDENTE: 'warning',
  EM_ANALISE: 'info',
  RESOLVIDA: 'success',
  ARQUIVADA: 'secondary',
  ENCAMINHADA: 'success',
}

const BOTAO_CADEADO =
  'inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/5'

type ListaEstado = 'idle' | 'loading' | 'ready' | 'error'

type DenunciasSensiveisSectionProps = {
  titulo: string
  descricaoAberta: string
  colunaAlvo: string
  colunaAutor: string
  alvoAusente: string
  papel: PapelUsuario
  carregar: () => Promise<DenunciaRegistro[]>
}

function rotuloMotivo(motivo: DenunciaRegistro['motivo']) {
  return MOTIVOS_DENUNCIA.find((item) => item.value === motivo)?.label ?? motivo
}

function resumir(texto: string) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= 96) return limpo
  return `${limpo.slice(0, 96).trimEnd()}…`
}

function formatData(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function DenunciasSensiveisSection({
  titulo,
  descricaoAberta,
  colunaAlvo,
  colunaAutor,
  alvoAusente,
  papel,
  carregar,
}: DenunciasSensiveisSectionProps) {
  const navigate = useNavigate()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [denuncias, setDenuncias] = useState<DenunciaRegistro[]>([])
  const [estado, setEstado] = useState<ListaEstado>('idle')

  useEffect(() => {
    if (!isUnlocked) return

    let ativo = true
    setEstado('loading')

    carregar()
      .then((lista) => {
        if (!ativo) return
        setDenuncias(lista)
        setEstado('ready')
      })
      .catch(() => {
        if (!ativo) return
        setEstado('error')
      })

    return () => {
      ativo = false
    }
  }, [isUnlocked, carregar])

  function abrirLista() {
    navigate(`/admin/denuncias?papel=${papel}`)
  }

  return (
    <Card
      className="mt-4 min-w-0 cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={abrirLista}
      onKeyDown={(event) => {
        if (event.key === 'Enter') abrirLista()
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnlocked ? (
            <Eye className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
          ) : (
            <EyeOff className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
          )}
          {titulo}
        </CardTitle>
        <CardDescription>
          {isUnlocked ? descricaoAberta : 'Conteúdo restrito e sensível'}
        </CardDescription>
        <CardAction>
          <button
            type="button"
            className={BOTAO_CADEADO}
            aria-pressed={isUnlocked}
            aria-label={isUnlocked ? 'Bloquear denúncias' : 'Desbloquear denúncias'}
            onClick={(event) => {
              event.stopPropagation()
              setIsUnlocked((aberto) => !aberto)
            }}
          >
            {isUnlocked ? (
              <Unlock className="size-4" aria-hidden />
            ) : (
              <Lock className="size-4" aria-hidden />
            )}
            {isUnlocked ? 'Bloquear' : 'Desbloquear'}
          </button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isUnlocked ? (
          <div className="starting:translate-y-1 starting:opacity-0 translate-y-0 opacity-100 transition-all duration-300 ease-out">
            <ListaDenuncias
              denuncias={denuncias}
              estado={estado}
              colunaAlvo={colunaAlvo}
              colunaAutor={colunaAutor}
              alvoAusente={alvoAusente}
              onSelecionar={(id) => navigate(`/admin/denuncias/${id}`)}
            />
          </div>
        ) : (
          <p className="starting:translate-y-1 starting:opacity-0 max-w-xl translate-y-0 text-sm leading-relaxed text-zinc-500 opacity-100 transition-all duration-300 ease-out dark:text-zinc-400">
            O conteúdo desta seção é restrito e sensível. Clique no cadeado para desbloquear e
            visualizar as ocorrências.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ListaDenuncias({
  denuncias,
  estado,
  colunaAlvo,
  colunaAutor,
  alvoAusente,
  onSelecionar,
}: {
  denuncias: DenunciaRegistro[]
  estado: ListaEstado
  colunaAlvo: string
  colunaAutor: string
  alvoAusente: string
  onSelecionar: (id: string) => void
}) {
  if (estado === 'loading' || estado === 'idle') {
    return <p className="text-sm text-zinc-500">Carregando denúncias…</p>
  }

  if (estado === 'error') {
    return (
      <p className="text-sm text-red-500" role="status">
        Não foi possível carregar as denúncias.
      </p>
    )
  }

  if (denuncias.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhuma denúncia registrada.</p>
  }

  return (
    <div className="-mx-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">{colunaAlvo}</TableHead>
            <TableHead>{colunaAutor}</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="pr-6">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {denuncias.map((denuncia) => (
            <TableRow
              key={denuncia.id}
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation()
                onSelecionar(denuncia.id)
              }}
            >
              <TableCell className="pl-6 font-medium">
                {denuncia.denunciadoNome || alvoAusente}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-300">
                {denuncia.denunciante.nome}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-300">
                {rotuloMotivo(denuncia.motivo)}
              </TableCell>
              <TableCell
                className="max-w-xs whitespace-normal text-zinc-600 dark:text-zinc-300"
                title={denuncia.descricao}
              >
                {resumir(denuncia.descricao)}
              </TableCell>
              <TableCell className="text-zinc-600 dark:text-zinc-300">
                {formatData(denuncia.dataCriacao)}
              </TableCell>
              <TableCell className="pr-6">
                <Badge variant={STATUS_VARIANT[denuncia.status] ?? 'secondary'}>
                  {STATUS_LABEL[denuncia.status] ?? denuncia.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
