export type Materia = {
  id: number
  nome: string
  descricao: string | null
  area: string | null
  ativa: boolean
}

export type NovaMateriaPayload = {
  nome: string
  descricao: string
  area: string
}
