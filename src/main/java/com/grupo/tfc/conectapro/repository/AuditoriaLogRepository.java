package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.AuditoriaLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditoriaLogRepository extends JpaRepository<AuditoriaLog, UUID> {

    Page<AuditoriaLog> findByUsuarioId(UUID usuarioId, Pageable pageable);

    Page<AuditoriaLog> findByAcao(AcaoAuditoria acao, Pageable pageable);

    Page<AuditoriaLog> findByUsuarioIdAndAcao(UUID usuarioId, AcaoAuditoria acao, Pageable pageable);
}
