package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.MateriaDTO;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class MateriaControllerIntegrationTest {

    private static final String MATERIAS = "/materias";
    private static final String AUTH = "/auth";
    private static final int NONEXISTENT_ID = 999999999;

    @LocalServerPort
    private int port;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private RestClient client;

    @BeforeEach
    void configurarCliente() {
        client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (req, res) -> {})
                .build();
    }

    @Test
    void listMaterias_shouldReturn200WithList() {
        long ts = System.nanoTime();
        String nome = "Matematica " + ts;
        criarMateriaComoAdmin(nome, "Algebra linear");

        ResponseEntity<List<MateriaDTO>> response = client.get().uri(MATERIAS)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull()
                .anySatisfy(materia -> assertThat(materia.nome()).isEqualTo(nome));
    }

    @Test
    void getById_existing_shouldReturn200WithFields() {
        long ts = System.nanoTime();
        String nome = "Fisica " + ts;
        Integer id = criarMateriaComoAdmin(nome, "Cinematica");

        ResponseEntity<MateriaDTO> response = client.get().uri(MATERIAS + "/" + id)
                .retrieve()
                .toEntity(MateriaDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MateriaDTO body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.id()).isEqualTo(id);
        assertThat(body.nome()).isEqualTo(nome);
        assertThat(body.descricao()).isEqualTo("Cinematica");
        assertThat(body.ativa()).isTrue();
    }

    @Test
    void getById_nonExistent_shouldReturn404WithMessage() {
        ResponseEntity<Map<String, Object>> response = client.get().uri(MATERIAS + "/" + NONEXISTENT_ID)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(String.valueOf(response.getBody().get("message"))).contains("encontrada");
    }

    @Test
    void createMateriaFlow_shouldAppearInList() {
        long ts = System.nanoTime();
        String cookie = registrarAdminELogar("admin" + ts + "@conecta.pro", "senha12345");
        String nome = "Quimica " + ts;

        ResponseEntity<MateriaDTO> criada = client.post().uri(MATERIAS)
                .header(HttpHeaders.COOKIE, cookie)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, nome, "Quimica organica", null, null))
                .retrieve()
                .toEntity(MateriaDTO.class);

        assertThat(criada.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(criada.getBody()).isNotNull();
        Integer id = criada.getBody().id();
        assertThat(id).isNotNull();

        ResponseEntity<List<MateriaDTO>> lista = client.get().uri(MATERIAS)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<>() {});

        assertThat(lista.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(lista.getBody()).isNotNull()
                .anySatisfy(materia -> {
                    assertThat(materia.id()).isEqualTo(id);
                    assertThat(materia.nome()).isEqualTo(nome);
                });
    }

    private Integer criarMateriaComoAdmin(String nome, String descricao) {
        long ts = System.nanoTime();
        String cookie = registrarAdminELogar("admin" + ts + "@conecta.pro", "senha12345");

        ResponseEntity<MateriaDTO> response = client.post().uri(MATERIAS)
                .header(HttpHeaders.COOKIE, cookie)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, nome, descricao, null, null))
                .retrieve()
                .toEntity(MateriaDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody().id();
    }

    private String registrarAdminELogar(String email, String senha) {
        client.post().uri(AUTH + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nome", "Admin Teste", "email", email, "senha", senha, "tipo", "PROFESSOR"))
                .retrieve()
                .toBodilessEntity();

        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        usuario.setAdmin(true);
        usuarioRepository.save(usuario);

        ResponseEntity<Void> login = client.post().uri(AUTH + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "senha", senha))
                .retrieve()
                .toBodilessEntity();

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        return extrairJsessionId(login.getHeaders());
    }

    private String extrairJsessionId(HttpHeaders headers) {
        List<String> cookies = headers.get(HttpHeaders.SET_COOKIE);
        assertThat(cookies).isNotNull().isNotEmpty();
        return cookies.stream()
                .filter(cookie -> cookie.startsWith("JSESSIONID"))
                .map(cookie -> cookie.split(";", 2)[0])
                .findFirst()
                .orElseThrow();
    }

    @Test
    void criar_comoAdmin_deveRetornar201EPersistir() {
        long ts = System.nanoTime();
        String cookie = registrarAdminELogar("admin" + ts + "@conecta.pro", "senha12345");
        String nome = "Biologia " + ts;

        ResponseEntity<MateriaDTO> response = client.post().uri(MATERIAS)
                .header(HttpHeaders.COOKIE, cookie)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, nome, "Genetica", null, null))
                .retrieve()
                .toEntity(MateriaDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        MateriaDTO body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.id()).isNotNull();
        assertThat(body.nome()).isEqualTo(nome);

        assertThat(materiaRepository.findById(body.id()))
                .isPresent()
                .get()
                .satisfies(materia -> assertThat(materia.getNome()).isEqualTo(nome));
    }

    @Test
    void criar_comoAdmin_deveRetornar201ComHeaderContentTypeJson() {
        long ts = System.nanoTime();
        String cookie = registrarAdminELogar("admin" + ts + "@conecta.pro", "senha12345");
        String nome = "Sociologia " + ts;

        ResponseEntity<MateriaDTO> response = client.post().uri(MATERIAS)
                .header(HttpHeaders.COOKIE, cookie)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, nome, "Teoria social", null, null))
                .retrieve()
                .toEntity(MateriaDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().isCompatibleWith(MediaType.APPLICATION_JSON)).isTrue();
    }

    @Test
    void criar_semSessao_deveRetornar401() {
        long ts = System.nanoTime();

        ResponseEntity<Void> response = client.post().uri(MATERIAS)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, "Historia " + ts, "Idade media", null, null))
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void criar_comUsuarioNaoAdmin_deveRetornar403() {
        long ts = System.nanoTime();
        String cookie = registrarUsuarioComumELogar("usuario" + ts + "@conecta.pro", "senha12345");

        ResponseEntity<Void> response = client.post().uri(MATERIAS)
                .header(HttpHeaders.COOKIE, cookie)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MateriaDTO(null, "Geografia " + ts, "Relevo", null, null))
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    private String registrarUsuarioComumELogar(String email, String senha) {
        client.post().uri(AUTH + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nome", "Usuario Teste", "email", email, "senha", senha, "tipo", "PROFESSOR"))
                .retrieve()
                .toBodilessEntity();

        ResponseEntity<Void> login = client.post().uri(AUTH + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "senha", senha))
                .retrieve()
                .toBodilessEntity();

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        return extrairJsessionId(login.getHeaders());
    }
}
