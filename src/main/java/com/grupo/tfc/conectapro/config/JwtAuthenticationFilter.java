package com.grupo.tfc.conectapro.config;

import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.JwtService;
import com.grupo.tfc.conectapro.service.TokenBlocklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final TokenBlocklistService tokenBlocklistService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UsuarioRepository usuarioRepository,
                                   TokenBlocklistService tokenBlocklistService) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.tokenBlocklistService = tokenBlocklistService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        var token = recuperarToken(request);
        var jwt = token != null ? jwtService.validarToken(token) : null;

        if (jwt != null && JwtService.SCOPE_FULL_ACCESS.equals(jwtService.extrairScope(jwt))
                && !tokenBlocklistService.estaRevogado(jwtService.extrairJti(jwt))) {
            UUID userId = jwtService.extrairUserId(jwt);
            if (sessaoAtiva(userId)) {
                String role = jwtService.extrairRole(jwt);
                boolean admin = jwtService.extrairAdmin(jwt);

                var usuario = new UsuarioUserDetails(userId, role, admin);
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, usuario.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean sessaoAtiva(UUID userId) {
        return usuarioRepository.findById(userId)
                .map(this::contaPermiteSessao)
                .orElse(false);
    }

    private boolean contaPermiteSessao(Usuario usuario) {
        if (usuario.getStatusConta() == StatusConta.BANIDO) {
            return false;
        }
        OffsetDateTime bloqueadoAte = usuario.getBloqueadoAte();
        return bloqueadoAte == null || !OffsetDateTime.now().isBefore(bloqueadoAte);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
