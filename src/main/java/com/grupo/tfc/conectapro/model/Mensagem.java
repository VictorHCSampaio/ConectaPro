package com.grupo.tfc.conectapro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(
        name = "mensagens",
        uniqueConstraints = @UniqueConstraint(
                name = "ux_mensagens_idempotency_key",
                columnNames = "idempotency_key"
        ),
        indexes = @Index(
                name = "idx_mensagens_remetente_destinatario_data",
                columnList = "remetente_id, destinatario_id, data_envio"
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "remetente_id", nullable = false)
    private Usuario remetente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    @Column(nullable = false, columnDefinition = "text")
    private String conteudo;

    @Column(nullable = false)
    @Builder.Default
    private boolean lida = false;

    /** Chegou na caixa do destinatário. A leitura continua em {@code lida}. */
    @Column(nullable = false)
    @Builder.Default
    private boolean entregue = false;

    @Column(name = "data_envio", nullable = false, columnDefinition = "timestamp with time zone")
    private OffsetDateTime dataEnvio;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @PrePersist
    void preencherDataEnvio() {
        dataEnvio = OffsetDateTime.now();
    }
}
