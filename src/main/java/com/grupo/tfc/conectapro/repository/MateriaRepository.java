package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MateriaRepository extends JpaRepository<Materia, UUID> {
    Optional<Materia> findFirstByNomeIgnoreCase(String nome);
    Optional<Materia> findById(Integer id);
}
