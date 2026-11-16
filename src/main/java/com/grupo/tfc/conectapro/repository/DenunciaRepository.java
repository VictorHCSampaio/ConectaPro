package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {

    List<Denuncia> findAllByOrderByDataCriacaoDesc();

    List<Denuncia> findByDenuncianteIdOrDenunciadoId(UUID denuncianteId, UUID denunciadoId);

    List<Denuncia> findByDenunciado_TipoOrderByDataCriacaoDesc(TipoUsuario tipo);
}
