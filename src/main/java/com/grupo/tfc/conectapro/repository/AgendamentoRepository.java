package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID> {

    List<Agendamento> findByAlunoIdOrderByCriadoEmDesc(UUID alunoId);

    List<Agendamento> findByProfessorIdOrderByCriadoEmDesc(UUID professorId);

    boolean existsByProfessorIdAndDiaSemanaAndHorarioAndStatusIn(
            UUID professorId, String diaSemana, String horario, Collection<StatusAgendamento> status);

    List<Agendamento> findByProfessorIdAndStatusIn(UUID professorId, Collection<StatusAgendamento> status);

    List<Agendamento> findTop5ByOrderByCriadoEmDesc();

    long countByStatusAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
            StatusAgendamento status, OffsetDateTime inicio, OffsetDateTime fim);

    @Query("""
            select agendamento from Agendamento agendamento
            join fetch agendamento.aluno
            join fetch agendamento.professor professor
            join fetch professor.usuario
            where agendamento.status = :status
            """)
    List<Agendamento> buscarPorStatusComParticipantes(@Param("status") StatusAgendamento status);
}
