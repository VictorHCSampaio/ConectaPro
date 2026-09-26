package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnderecoRepository extends JpaRepository<Endereco, UUID> {
    Optional<Endereco> findFirstByUsuarioId(UUID usuarioId);

    List<Endereco> findByUsuarioIdIn(Collection<UUID> usuarioIds);

    List<Endereco> findByLatitudeIsNull();
}
