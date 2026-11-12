package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Notificacao;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {

    List<Notificacao> findByUsuarioIdOrderByDataCriacaoDesc(UUID usuarioId);

    long countByUsuarioIdAndLidaFalse(UUID usuarioId);

    boolean existsByUsuarioIdAndTipoAndMensagemAndDataCriacaoAfter(
            UUID usuarioId, TipoNotificacao tipo, String mensagem, OffsetDateTime desde);
}
