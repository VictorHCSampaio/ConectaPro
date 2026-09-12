package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {
    Optional<Professor> findByUsuarioId(UUID usuarioId);
}
