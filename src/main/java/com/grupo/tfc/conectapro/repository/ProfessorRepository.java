package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {
    Optional<Professor> findByUsuarioId(UUID usuarioId);

    long countByUsuario_StatusConta(StatusConta statusConta);

    @Query("SELECT p FROM Professor p JOIN FETCH p.usuario u WHERE u.statusConta = com.grupo.tfc.conectapro.model.StatusConta.ATIVO")
    List<Professor> findAtivosComUsuario();
}
