package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

    Optional<Pagamento> findByMercadoPagoPreferenceId(String preferenceId);

    Optional<Pagamento> findByMercadoPagoPaymentId(String paymentId);

    Optional<Pagamento> findTopByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);

    @Query("""
            select coalesce(sum(p.valor), 0)
            from Pagamento p
            where p.status = com.grupo.tfc.conectapro.model.StatusPagamento.APROVADO
              and p.criadoEm >= :inicio
              and p.criadoEm < :fim
            """)
    BigDecimal somarReceitaAprovadaNoMes(@Param("inicio") OffsetDateTime inicio, @Param("fim") OffsetDateTime fim);
}
