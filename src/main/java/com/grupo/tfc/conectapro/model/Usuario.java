package com.grupo.tfc.conectapro.model;

import com.grupo.tfc.conectapro.config.TotpSegredoConverter;
import jakarta.persistence.*;
import lombok.*;

import static com.grupo.tfc.conectapro.model.StatusConta.ATIVO;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", length = 255)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private TipoUsuario tipo = TipoUsuario.ALUNO;

    @Column(name = "criado_em")
    private OffsetDateTime criadoEm;

    @Column(name = "is_admin")
    private boolean admin;

    @Convert(converter = TotpSegredoConverter.class)
    @Column(name = "segredo_totp", length = 255)
    private String segredoTotp;

    @Column(name = "totp_ativo")
    @Builder.Default
    private boolean totpAtivo = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_conta")
    @Builder.Default
    private StatusConta statusConta = ATIVO;

    @Column(name = "tentativas_login_falha")
    @Builder.Default
    private int tentativasLoginFalha = 0;

    @Column(name = "bloqueado_ate")
    private OffsetDateTime bloqueadoAte;
}
