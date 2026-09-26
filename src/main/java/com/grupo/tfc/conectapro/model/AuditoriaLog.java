package com.grupo.tfc.conectapro.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "auditoria_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "acao", nullable = false)
    private AcaoAuditoria acao;

    @Column(name = "recurso")
    private String recurso;

    @Column(name = "recurso_id")
    private String recursoId;

    @Column(name = "detalhes")
    private String detalhes;

    @Column(name = "ip")
    private String ip;

    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;
}
