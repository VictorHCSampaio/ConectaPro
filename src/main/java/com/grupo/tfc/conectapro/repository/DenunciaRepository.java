package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {
}
