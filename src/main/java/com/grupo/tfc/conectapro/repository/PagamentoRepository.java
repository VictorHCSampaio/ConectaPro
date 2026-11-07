package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

    Optional<Pagamento> findByMercadoPagoPreferenceId(String preferenceId);

    Optional<Pagamento> findByMercadoPagoPaymentId(String paymentId);

    Optional<Pagamento> findTopByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);
}
