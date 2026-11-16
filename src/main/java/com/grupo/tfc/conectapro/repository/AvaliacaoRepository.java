package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {

    List<Avaliacao> findByAvaliadoIdOrderByCriadoEmDesc(UUID avaliadoId);

    boolean existsByAvaliadorIdAndAgendamentoId(UUID avaliadorId, UUID agendamentoId);

    List<Avaliacao> findByAgendamentoId(UUID agendamentoId);

    List<Avaliacao> findByAvaliadorIdOrderByCriadoEmDesc(UUID avaliadorId);
}
