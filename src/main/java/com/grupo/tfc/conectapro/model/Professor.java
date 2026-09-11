package com.grupo.tfc.conectapro.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "professor")
@Getter
@Setter
@NoArgsConstructor
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(columnDefinition = "text")
    private String biografia;

    @Column(name = "preco_hora_particular")
    private BigDecimal precoHoraParticular;

    @Column(name = "preco_hora_escola")
    private BigDecimal precoHoraEscola;

    @Column(name = "atende_online")
    private Boolean atendeOnline;

    @Column(name = "atende_presencial")
    private Boolean atendePresencial;

    @Column
    private String cep;

    @Column
    private String endereco;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column
    private Boolean verificado;
}
