package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.ProfessorDisponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfessorDisponibilidadeRepository extends JpaRepository<ProfessorDisponibilidade, UUID> {
    List<ProfessorDisponibilidade> findByProfessorId(UUID professorId);

    void deleteByProfessorId(UUID professorId);
}
