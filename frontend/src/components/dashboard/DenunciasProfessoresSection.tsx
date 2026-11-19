import { DenunciasSensiveisSection } from '@/components/dashboard/DenunciasSensiveisSection'
import { listarDenunciasProfessores } from '@/lib/denunciaService'

export function DenunciasProfessoresSection() {
  return (
    <DenunciasSensiveisSection
      titulo="Denúncias de Professores"
      descricaoAberta="Ocorrências registradas contra perfis de professores"
      colunaAlvo="Professor denunciado"
      colunaAutor="Autor / aluno"
      alvoAusente="Professor removido"
      papel="PROFESSOR"
      carregar={listarDenunciasProfessores}
    />
  )
}
