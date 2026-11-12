package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.JwtProperties;
import com.grupo.tfc.conectapro.dto.auth.LoginResponse;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Cenários de segurança que complementam MateriaControllerIntegrationTest.
 *
 * Já cobertos em MateriaControllerIntegrationTest:
 *   - POST /materias sem token → 401
 *   - POST /materias usuário comum → 403
 *   - POST /materias admin → 201
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtProperties jwtProperties;

    private RestClient client;

    @BeforeEach
    void configurarCliente() {
        client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (req, res) -> {})
                .build();
    }

    // --- (d) GET /auditoria: comum → 403, admin → 200 ---

    @Test
    void auditoria_comUsuarioComum_deveRetornar403() {
        long ts = System.nanoTime();
        String token = registrarUsuarioComumELogar("comum.sec" + ts + "@test.com", "senha12345");

        ResponseEntity<Void> response = client.get().uri("/auditoria?pagina=0&tamanho=5")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void auditoria_comAdmin_deveRetornar200() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("admin.sec" + ts + "@test.com", "senha12345");

        ResponseEntity<String> response = client.get().uri("/auditoria?pagina=0&tamanho=5")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toEntity(String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void dashboard_comUsuarioComum_deveRetornar403() {
        long ts = System.nanoTime();
        String token = registrarUsuarioComumELogar("comum.dash" + ts + "@test.com", "senha12345");

        ResponseEntity<Void> response = client.get().uri("/dashboard")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void dashboardResumo_comUsuarioComum_deveRetornar403() {
        long ts = System.nanoTime();
        String token = registrarUsuarioComumELogar("comum.resumo" + ts + "@test.com", "senha12345");

        ResponseEntity<Void> response = client.get().uri("/dashboard/resumo")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void dashboardResumo_comAdmin_deveRetornarContagens() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("admin.resumo" + ts + "@test.com", "senha12345");

        ResponseEntity<String> response = client.get().uri("/dashboard/resumo")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toEntity(String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"totalAlunos\"");
        assertThat(response.getBody()).contains("\"totalProfessores\"");
    }

    @Test
    void dashboard_comAdmin_deveRetornar200() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("admin.dash" + ts + "@test.com", "senha12345");

        ResponseEntity<Void> response = client.get().uri("/dashboard")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // --- (e) Token com assinatura adulterada → 401 ---

    @Test
    void tokenAdulterado_deveRetornar401() {
        long ts = System.nanoTime();
        String tokenValido = registrarAdminELogar("adulterado.sec" + ts + "@test.com", "senha12345");
        String tokenAdulterado = tokenValido.substring(0, tokenValido.length() - 4) + "XXXX";

        ResponseEntity<Void> response = client.get().uri("/auditoria?pagina=0&tamanho=5")
                .header("Authorization", "Bearer " + tokenAdulterado)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // --- (f) Payload JWT: apenas claims permitidos, sem PII, expiração correta ---

    @Test
    void payloadJwt_deveConterApenasClaimsPermitidos_semPII() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("payload.sec" + ts + "@test.com", "senha12345");

        String[] partes = token.split("\\.");
        assertThat(partes).hasSize(3);

        String payloadJson = new String(Base64.getUrlDecoder().decode(partes[1]));

        assertThat(payloadJson).doesNotContain("@");
        assertThat(payloadJson).doesNotContain("payload.sec");
        assertThat(payloadJson).doesNotContain("cpf");
        assertThat(payloadJson).doesNotContain("telefone");
        assertThat(payloadJson).doesNotContain("phone");
        assertThat(payloadJson).doesNotContain("nomeCompleto");

        assertThat(payloadJson).contains("\"sub\"");
        assertThat(payloadJson).contains("\"scope\"");
        assertThat(payloadJson).contains("\"role\"");
        assertThat(payloadJson).contains("\"iat\"");
        assertThat(payloadJson).contains("\"exp\"");
    }

    @Test
    void payloadJwt_expMenosIat_deveSerIgualExpiracaoConfigurada() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("exp.sec" + ts + "@test.com", "senha12345");

        String[] partes = token.split("\\.");
        String payloadJson = new String(Base64.getUrlDecoder().decode(partes[1]));

        long iat = extrairNumericClaim(payloadJson, "iat");
        long exp = extrairNumericClaim(payloadJson, "exp");

        long diferencaSegundos = exp - iat;
        long esperadoSegundos = jwtProperties.expiracaoMinutos() * 60;

        assertThat(diferencaSegundos).isEqualTo(esperadoSegundos);
    }

    @Test
    void payloadJwt_deveConterApenasClaimsConhecidos() {
        long ts = System.nanoTime();
        String token = registrarAdminELogar("claims.sec" + ts + "@test.com", "senha12345");

        String[] partes = token.split("\\.");
        String payloadJson = new String(Base64.getUrlDecoder().decode(partes[1]));

        Set<String> claimsPermitidos = Set.of("sub", "scope", "role", "admin", "iat", "exp", "iss");
        String limpo = payloadJson.replaceAll("[{}\" ]", "");
        String[] pares = limpo.split(",");
        for (String par : pares) {
            String chave = par.split(":")[0];
            assertThat(claimsPermitidos)
                    .as("Claim inesperado no JWT: '%s'", chave)
                    .contains(chave);
        }
    }

    // --- helpers ---

    private String registrarAdminELogar(String email, String senha) {
        client.post().uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nome", "Admin Teste", "email", email, "password", senha))
                .retrieve()
                .toBodilessEntity();

        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        usuario.setAdmin(true);
        usuarioRepository.save(usuario);

        ResponseEntity<LoginResponse> login = client.post().uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "senha", senha))
                .retrieve()
                .toEntity(LoginResponse.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody()).isNotNull();
        assertThat(login.getBody().token()).isNotNull();
        return login.getBody().token();
    }

    private String registrarUsuarioComumELogar(String email, String senha) {
        client.post().uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nome", "Usuario Teste", "email", email, "password", senha))
                .retrieve()
                .toBodilessEntity();

        ResponseEntity<LoginResponse> login = client.post().uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "senha", senha))
                .retrieve()
                .toEntity(LoginResponse.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody()).isNotNull();
        assertThat(login.getBody().token()).isNotNull();
        return login.getBody().token();
    }

    private long extrairNumericClaim(String payloadJson, String claim) {
        String busca = "\"" + claim + "\":";
        int inicio = payloadJson.indexOf(busca) + busca.length();
        int fim = payloadJson.indexOf(",", inicio);
        if (fim == -1) fim = payloadJson.indexOf("}", inicio);
        return Long.parseLong(payloadJson.substring(inicio, fim).trim());
    }
}
