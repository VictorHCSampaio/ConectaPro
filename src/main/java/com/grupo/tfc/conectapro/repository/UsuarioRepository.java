package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);

    long countByTipo(TipoUsuario tipo);

    long countByTipoAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
            TipoUsuario tipo, OffsetDateTime inicio, OffsetDateTime fim);

    List<Usuario> findByCriadoEmGreaterThanEqualAndCriadoEmLessThan(OffsetDateTime inicio, OffsetDateTime fim);

    @Query("select u.id from Usuario u where u.criadoEm is null")
    List<UUID> findIdsComCriadoEmNulo();
}
