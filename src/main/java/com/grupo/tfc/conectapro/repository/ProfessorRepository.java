package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusComprovacao;
import com.grupo.tfc.conectapro.model.StatusConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {
    @Query("""
            SELECT p FROM Professor p
            JOIN FETCH p.usuario
            WHERE p.usuario.id = :usuarioId
            """)
    Optional<Professor> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

    long countByUsuario_StatusConta(StatusConta statusConta);

    @Query("select min(p.criadoEm) from Professor p")
    OffsetDateTime buscarMenorCriadoEm();

    @Query("""
            SELECT p FROM Professor p JOIN FETCH p.usuario u
            WHERE u.statusConta = com.grupo.tfc.conectapro.model.StatusConta.ATIVO
              AND u.admin = false
              AND u.tipo = com.grupo.tfc.conectapro.model.TipoUsuario.PROFESSOR
            """)
    List<Professor> findAtivosComUsuario();

    @Query("""
            SELECT p FROM Professor p JOIN FETCH p.usuario u
            WHERE p.statusComprovacao = :status
              AND u.tipo = com.grupo.tfc.conectapro.model.TipoUsuario.PROFESSOR
            """)
    List<Professor> findByStatusComprovacaoWithUsuario(@Param("status") StatusComprovacao status);
}
