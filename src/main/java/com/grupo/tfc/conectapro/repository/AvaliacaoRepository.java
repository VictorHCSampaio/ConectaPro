package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {

    @Query("""
            select new com.grupo.tfc.conectapro.repository.AvaliacaoAgregado(
                count(a),
                coalesce(sum(a.nota), 0)
            )
            from Avaliacao a
            where a.avaliado.id = :avaliadoId
            """)
    AvaliacaoAgregado agregarPorAvaliado(@Param("avaliadoId") UUID avaliadoId);

    List<Avaliacao> findByAvaliadoIdOrderByCriadoEmDesc(UUID avaliadoId);

    boolean existsByAvaliadorIdAndAgendamentoId(UUID avaliadorId, UUID agendamentoId);

    List<Avaliacao> findByAgendamentoId(UUID agendamentoId);

    List<Avaliacao> findByAvaliadorIdOrderByCriadoEmDesc(UUID avaliadorId);
}
