import { DenunciasSensiveisSection } from '@/components/dashboard/DenunciasSensiveisSection'
import { listarDenunciasAlunos } from '@/lib/denunciaService'

export function DenunciasAlunosSection() {
  return (
    <DenunciasSensiveisSection
      titulo="Denúncias de Alunos"
      descricaoAberta="Ocorrências registradas contra perfis de alunos"
      colunaAlvo="Aluno denunciado"
      colunaAutor="Autor"
      alvoAusente="Aluno removido"
      papel="ALUNO"
      carregar={listarDenunciasAlunos}
    />
  )
}
