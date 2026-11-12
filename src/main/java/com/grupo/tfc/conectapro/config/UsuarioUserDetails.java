package com.grupo.tfc.conectapro.config;

import com.grupo.tfc.conectapro.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Adapta o usuário autenticado para o Spring Security.
 * O papel de administrador sai exclusivamente do booleano {@code isAdmin}.
 */
public final class UsuarioUserDetails implements UserDetails {

    private final UUID id;
    private final String role;
    private final boolean admin;

    public UsuarioUserDetails(UUID id, String role, boolean admin) {
        this.id = id;
        this.role = role;
        this.admin = admin;
    }

    public static UsuarioUserDetails from(Usuario usuario) {
        String role = usuario.getTipo() == null ? null : usuario.getTipo().name();
        return new UsuarioUserDetails(usuario.getId(), role, usuario.isAdmin());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (role != null && !role.isBlank()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        if (admin) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return List.copyOf(authorities);
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return id == null ? "" : id.toString();
    }
}
