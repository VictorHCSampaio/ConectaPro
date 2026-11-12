package com.grupo.tfc.conectapro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "denuncias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "denunciante_id", nullable = false)
    private Usuario denunciante;

    @ManyToOne(optional = false)
    @JoinColumn(name = "denunciado_id", nullable = false)
    private Professor denunciado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private MotivoDenuncia motivo;

    @Column(nullable = false, columnDefinition = "text")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusDenuncia status = StatusDenuncia.PENDENTE;

    @Column(name = "data_criacao", nullable = false, columnDefinition = "timestamp with time zone")
    private OffsetDateTime dataCriacao;

    @PrePersist
    void preencherDataCriacao() {
        dataCriacao = OffsetDateTime.now();
        if (status == null) {
            status = StatusDenuncia.PENDENTE;
        }
    }
}
