package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.ProfessorMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ProfessorMateriaRepository extends JpaRepository<ProfessorMateria, UUID> {
    List<ProfessorMateria> findByProfessorId(UUID professorId);

    void deleteByProfessorId(UUID professorId);

    @Query("""
            select m.nome as disciplina, count(pm) as quantidade
            from ProfessorMateria pm
            join pm.materia m
            join pm.professor p
            where p.criadoEm >= :inicio and p.criadoEm < :fim
            group by m.nome
            order by count(pm) desc
            """)
    List<ContagemDisciplinaView> contarProfessoresPorMateria(
            @Param("inicio") OffsetDateTime inicio, @Param("fim") OffsetDateTime fim);
}
