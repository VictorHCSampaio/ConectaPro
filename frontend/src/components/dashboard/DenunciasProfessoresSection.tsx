import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { MOTIVOS_DENUNCIA, listarDenuncias } from '@/lib/denunciaService'
import type { DenunciaRegistro, StatusDenuncia } from '@/lib/denunciaService'

const STATUS_LABEL: Record<StatusDenuncia, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  RESOLVIDA: 'Resolvida',
}

const STATUS_VARIANT: Record<StatusDenuncia, BadgeVariant> = {
  PENDENTE: 'warning',
  EM_ANALISE: 'info',
  RESOLVIDA: 'success',
}

const BOTAO_CADEADO =
  'inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/5'

type ListaEstado = 'idle' | 'loading' | 'ready' | 'error'

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

export function DenunciasProfessoresSection() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [denuncias, setDenuncias] = useState<DenunciaRegistro[]>([])
  const [estado, setEstado] = useState<ListaEstado>('idle')

  useEffect(() => {
    if (!isUnlocked) return

    let ativo = true
    setEstado('loading')

    listarDenuncias()
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
  }, [isUnlocked])

  function alternarCadeado() {
    setIsUnlocked((aberto) => !aberto)
  }

  return (
    <Card className="mt-4 min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnlocked ? (
            <Eye className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
          ) : (
            <EyeOff className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
          )}
          Denúncias de Professores
        </CardTitle>
        <CardDescription>
          {isUnlocked
            ? 'Ocorrências registradas contra perfis de professores'
            : 'Conteúdo restrito e sensível'}
        </CardDescription>
        <CardAction>
          <button
            type="button"
            className={BOTAO_CADEADO}
            aria-pressed={isUnlocked}
            aria-label={isUnlocked ? 'Bloquear denúncias' : 'Desbloquear denúncias'}
            onClick={alternarCadeado}
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
            <ListaDenuncias denuncias={denuncias} estado={estado} />
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
}: {
  denuncias: DenunciaRegistro[]
  estado: ListaEstado
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
            <TableHead className="pl-6">Professor denunciado</TableHead>
            <TableHead>Autor / aluno</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="pr-6">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {denuncias.map((denuncia) => (
            <TableRow key={denuncia.id}>
              <TableCell className="pl-6 font-medium">
                {denuncia.professorNome || 'Professor removido'}
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
