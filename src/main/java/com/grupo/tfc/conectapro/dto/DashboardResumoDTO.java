package com.grupo.tfc.conectapro.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record DashboardResumoDTO(
        long totalAlunos,
        long totalProfessores,
        long aulasConfirmadasNoMes,
        BigDecimal receitaAssinaturasMes,
        List<PontoMensalDTO> novosUsuarios,
        List<ContagemDisciplinaDTO> professoresPorMateria,
        List<AulaRecenteDTO> ultimasAulas,
        List<AtividadeRecenteDTO> atividadesRecentes
) {
    public record PontoMensalDTO(String mes, long alunos, long professores) {
    }

    public record ContagemDisciplinaDTO(String disciplina, long quantidade) {
    }

    public record AulaRecenteDTO(
            String professor,
            String aluno,
            String materia,
            String diaSemana,
            String horario,
            String status,
            OffsetDateTime criadoEm
    ) {
    }

    public record AtividadeRecenteDTO(String nome, String acao, OffsetDateTime quando) {
    }
}
