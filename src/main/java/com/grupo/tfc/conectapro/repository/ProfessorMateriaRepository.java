package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.ProfessorMateria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfessorMateriaRepository extends JpaRepository<ProfessorMateria, UUID> {
    List<ProfessorMateria> findByProfessorId(UUID professorId);

    void deleteByProfessorId(UUID professorId);
}
