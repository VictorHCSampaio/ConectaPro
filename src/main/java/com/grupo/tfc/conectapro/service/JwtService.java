package com.grupo.tfc.conectapro.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.grupo.tfc.conectapro.config.JwtProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private static final String ISSUER = "conectapro";

    public static final String SCOPE_FULL_ACCESS = "FULL_ACCESS";
    public static final String SCOPE_PRE_AUTH = "PRE_AUTH";
    public static final String SCOPE_PASSWORD_RESET = "PASSWORD_RESET";

    private final Algorithm algorithm;
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.algorithm = Algorithm.HMAC256(properties.secret());
    }

    public String gerarToken(UUID userId, String role, boolean admin) {
        return buildToken(userId, SCOPE_FULL_ACCESS, role, admin, properties.expiracaoMinutos());
    }

    public String gerarPreAuthToken(UUID userId) {
        return buildToken(userId, SCOPE_PRE_AUTH, null, false, properties.preAuthExpiracaoMinutos());
    }

    public DecodedJWT validarToken(String token) {
        try {
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(token);
        } catch (JWTVerificationException e) {
            logger.debug("Token JWT inválido. motivo={}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenValido(String token) {
        return validarToken(token) != null;
    }

    public UUID extrairUserId(DecodedJWT jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    public String extrairScope(DecodedJWT jwt) {
        return jwt.getClaim("scope").asString();
    }

    public String extrairRole(DecodedJWT jwt) {
        return jwt.getClaim("role").asString();
    }

    public boolean extrairAdmin(DecodedJWT jwt) {
        return Boolean.TRUE.equals(jwt.getClaim("admin").asBoolean());
    }

    public String gerarPasswordResetToken(UUID userId, String senhaHash, long expiracaoMinutos) {
        try {
            Algorithm resetAlgorithm = Algorithm.HMAC256(properties.secret() + senhaHash);
            Instant agora = Instant.now();
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(userId.toString())
                    .withClaim("scope", SCOPE_PASSWORD_RESET)
                    .withIssuedAt(agora)
                    .withExpiresAt(gerarDataExpiracao(agora, expiracaoMinutos))
                    .sign(resetAlgorithm);
        } catch (JWTCreationException e) {
            throw new RuntimeException("Erro ao gerar token de reset de senha", e);
        }
    }

    public DecodedJWT validarPasswordResetToken(String token, String senhaHash) {
        try {
            Algorithm resetAlgorithm = Algorithm.HMAC256(properties.secret() + senhaHash);
            DecodedJWT jwt = JWT.require(resetAlgorithm)
                    .withIssuer(ISSUER)
                    .withClaim("scope", SCOPE_PASSWORD_RESET)
                    .build()
                    .verify(token);
            return jwt;
        } catch (JWTVerificationException e) {
            logger.debug("Token de reset inválido. motivo={}", e.getMessage());
            return null;
        }
    }

    private String buildToken(UUID userId, String scope, String role, boolean admin, long expiracaoMinutos) {
        try {
            Instant agora = Instant.now();
            var builder = JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(userId.toString())
                    .withClaim("scope", scope)
                    .withIssuedAt(agora)
                    .withExpiresAt(gerarDataExpiracao(agora, expiracaoMinutos));

            if (role != null) {
                builder.withClaim("role", role);
            }
            if (admin) {
                builder.withClaim("admin", true);
            }

            return builder.sign(algorithm);
        } catch (JWTCreationException e) {
            throw new RuntimeException("Erro ao gerar token JWT", e);
        }
    }

    private Instant gerarDataExpiracao(Instant base, long minutos) {
        return base.plusSeconds(minutos * 60);
    }
}
