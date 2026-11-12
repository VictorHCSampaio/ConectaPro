package com.grupo.tfc.conectapro.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "agendamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @ManyToOne
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @Column(name = "dia_semana", nullable = false)
    private String diaSemana;

    @Column(nullable = false)
    private String horario;

    @Column(nullable = false)
    private String modalidade;

    @Column(nullable = false)
    private String materia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusAgendamento status = StatusAgendamento.SOLICITADO;

    @Column(name = "slot_chave", unique = true)
    private String slotChave;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @PrePersist
    void prePersist() {
        criadoEm = OffsetDateTime.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void preUpdate() {
        atualizadoEm = OffsetDateTime.now();
    }
}
