package com.grupo.tfc.conectapro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "notificacoes", indexes = {
        @Index(name = "idx_notificacoes_usuario_data", columnList = "usuario_id, data_criacao"),
        @Index(name = "idx_notificacoes_usuario_lida", columnList = "usuario_id, lida")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, columnDefinition = "text")
    private String mensagem;

    @Column(nullable = false)
    @Builder.Default
    private boolean lida = false;

    @Column(name = "data_criacao", nullable = false, columnDefinition = "timestamp with time zone")
    private OffsetDateTime dataCriacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoNotificacao tipo;

    @PrePersist
    void preencherDataCriacao() {
        dataCriacao = OffsetDateTime.now();
    }
}
