package com.grupo.tfc.conectapro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "avaliacoes", uniqueConstraints =
        @UniqueConstraint(columnNames = {"avaliador_id", "avaliado_id", "agendamento_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliador_id", nullable = false)
    private Usuario avaliador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliado_id", nullable = false)
    private Usuario avaliado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    @Column(nullable = false)
    private int nota;

    @Column(columnDefinition = "text")
    private String comentario;

    @Column(name = "criado_em", nullable = false, columnDefinition = "timestamp with time zone")
    private OffsetDateTime criadoEm;

    @PrePersist
    void preencherCriadoEm() {
        if (criadoEm == null) {
            criadoEm = OffsetDateTime.now();
        }
    }
}
