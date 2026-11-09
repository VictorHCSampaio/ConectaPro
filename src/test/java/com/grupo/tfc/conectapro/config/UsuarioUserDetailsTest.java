package com.grupo.tfc.conectapro.config;

import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UsuarioUserDetailsTest {

    @Test
    void getAuthorities_quandoNaoEhAdmin_retornaSomenteOPapelDoUsuario() {
        Usuario usuario = usuario(false);

        assertThat(UsuarioUserDetails.from(usuario).getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_ALUNO");
    }

    @Test
    void getAuthorities_quandoEhAdmin_incluiRoleAdmin() {
        Usuario usuario = usuario(true);

        assertThat(UsuarioUserDetails.from(usuario).getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ALUNO", "ROLE_ADMIN");
    }

    @Test
    void getAuthorities_semPapelDeDominio_usaRoleUser() {
        var details = new UsuarioUserDetails(UUID.randomUUID(), null, false);

        assertThat(details.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
    }

    private Usuario usuario(boolean admin) {
        return Usuario.builder()
                .id(UUID.randomUUID())
                .email("aluno@test.com")
                .tipo(TipoUsuario.ALUNO)
                .admin(admin)
                .build();
    }
}
