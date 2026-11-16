package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.EmailService;
import com.grupo.tfc.conectapro.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.lenient;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ChatDenunciaIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ProfessorRepository professorRepository;
    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private EmailService emailService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        lenient().doNothing().when(emailService)
                .enviarAlertaDenuncia(any(Denuncia.class), anyString());

        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void chat_semToken_deveRetornar401() throws Exception {
        mockMvc.perform(post("/chat/mensagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"oi"}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/chat/mensagens/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/chat/conversas"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void chat_enviaEListaUsandoRemetenteDoJwt() throws Exception {
        Usuario aluno = salvarUsuario("Aluno Chat", TipoUsuario.ALUNO);
        Usuario professorUsuario = salvarUsuario("Professor Chat", TipoUsuario.PROFESSOR);
        Professor perfil = new Professor();
        perfil.setUsuario(professorUsuario);
        perfil.setAvatarUrl("https://cdn.conectapro.test/paulo.png");
        professorRepository.save(perfil);
        String tokenAluno = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);

        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + tokenAluno)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "remetenteId":"%s",
                                  "destinatarioId":"%s",
                                  "conteudo":"Podemos conversar antes de fechar?"
                                }
                                """.formatted(professorUsuario.getId(), professorUsuario.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remetente.id").value(aluno.getId().toString()))
                .andExpect(jsonPath("$.remetente.nome").value("Aluno Chat"))
                .andExpect(jsonPath("$.destinatario.id").value(professorUsuario.getId().toString()))
                .andExpect(jsonPath("$.destinatario.avatarUrl").value("https://cdn.conectapro.test/paulo.png"))
                .andExpect(jsonPath("$.lida").value(false))
                .andExpect(jsonPath("$.conteudo").value("Podemos conversar antes de fechar?"))
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .doesNotContain(aluno.getEmail())
                        .doesNotContain(professorUsuario.getEmail()));

        String tokenProfessor = jwtService.gerarToken(professorUsuario.getId(), professorUsuario.getTipo().name(), false);
        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + tokenProfessor)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"Claro, qual horário prefere?"}
                                """.formatted(aluno.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/chat/mensagens/" + professorUsuario.getId())
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].conteudo").value("Podemos conversar antes de fechar?"))
                .andExpect(jsonPath("$[0].lida").value(false))
                .andExpect(jsonPath("$[0].entregue").value(false))
                .andExpect(jsonPath("$[1].conteudo").value("Claro, qual horário prefere?"))
                .andExpect(jsonPath("$[1].lida").value(true))
                .andExpect(jsonPath("$[1].entregue").value(true));

        mockMvc.perform(get("/chat/conversas")
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].participante.id").value(professorUsuario.getId().toString()))
                .andExpect(jsonPath("$[0].participante.nome").value("Professor Chat"))
                .andExpect(jsonPath("$[0].ultimaMensagem").value("Claro, qual horário prefere?"))
                .andExpect(jsonPath("$[0].enviadaPorMim").value(false))
                .andExpect(jsonPath("$[0].naoLidas").value(0))
                .andExpect(jsonPath("$[0].email").doesNotExist());
    }

    @Test
    void chat_naoDevolveConversaDeTerceiros() throws Exception {
        Usuario curioso = salvarUsuario("Curioso", TipoUsuario.ALUNO);
        Usuario aluno = salvarUsuario("Aluno Privado", TipoUsuario.ALUNO);
        Usuario professor = salvarUsuario("Professor Privado", TipoUsuario.PROFESSOR);
        String tokenAluno = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);
        String tokenCurioso = jwtService.gerarToken(curioso.getId(), curioso.getTipo().name(), false);

        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + tokenAluno)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"combinado secreto da aula"}
                                """.formatted(professor.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/chat/mensagens/" + professor.getId())
                        .header("Authorization", "Bearer " + tokenCurioso))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0))
                .andExpect(jsonPath("$").value(not(hasItem(hasEntry("conteudo", "combinado secreto da aula")))));

        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + tokenAluno)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"outra","idempotencyKey":"chave-do-aluno"}
                                """.formatted(professor.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + tokenCurioso)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"quero o segredo","idempotencyKey":"chave-do-aluno"}
                                """.formatted(professor.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("Acesso negado a esta conversa"))
                .andExpect(jsonPath("$.erro").value(not("combinado secreto da aula")));

        mockMvc.perform(get("/chat/mensagens/" + aluno.getId())
                        .header("Authorization", "Bearer " + tokenCurioso))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .doesNotContain("combinado secreto"));
    }

    @Test
    void chat_conteudoEmBranco_deveRetornar400() throws Exception {
        Usuario aluno = salvarUsuario("Aluno Vazio", TipoUsuario.ALUNO);
        String token = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);

        mockMvc.perform(post("/chat/mensagens")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinatarioId":"%s","conteudo":"  "}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Conteúdo da mensagem é obrigatório"));
    }

    @Test
    void denuncia_registraContraProfessorComDenuncianteDoJwt() throws Exception {
        Usuario aluno = salvarUsuario("Aluno Denuncia", TipoUsuario.ALUNO);
        Usuario profUser = salvarUsuario("Professor Denuncia", TipoUsuario.PROFESSOR);
        profUser.setAvatarUrl("https://cdn.conectapro.test/denuncia.png");
        profUser = usuarioRepository.save(profUser);
        Professor professor = new Professor();
        professor.setUsuario(profUser);
        professor = professorRepository.save(professor);

        String profEmail = profUser.getEmail();
        String profId = profUser.getId().toString();
        String token = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);

        mockMvc.perform(post("/denuncias")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "denunciadoId":"%s",
                                  "motivo":"ASSEDIO",
                                  "descricao":"Conduta inadequada durante a aula online."
                                }
                                """.formatted(profId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.denunciante.id").value(aluno.getId().toString()))
                .andExpect(jsonPath("$.denunciante.nome").value("Aluno Denuncia"))
                .andExpect(jsonPath("$.denunciadoId").value(profId))
                .andExpect(jsonPath("$.denunciadoNome").value("Professor Denuncia"))
                .andExpect(jsonPath("$.denunciadoAvatar").value("https://cdn.conectapro.test/denuncia.png"))
                .andExpect(jsonPath("$.motivo").value("ASSEDIO"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.dataCriacao").isNotEmpty())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .doesNotContain(aluno.getEmail())
                        .doesNotContain(profEmail));
    }

    @Test
    void denuncia_semTokenOuMotivoInvalido_deveFalhar() throws Exception {
        mockMvc.perform(post("/denuncias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"denunciadoId":"%s","motivo":"FRAUDE","descricao":"Descrição longa o bastante."}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isUnauthorized());

        Usuario aluno = salvarUsuario("Aluno Motivo", TipoUsuario.ALUNO);
        String token = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);

        mockMvc.perform(post("/denuncias")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"denunciadoId":"%s","motivo":"INVASIVO","descricao":"Descrição longa o bastante."}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos"));
    }

    @Test
    void denuncia_listagemSomenteAdmin() throws Exception {
        Usuario aluno = salvarUsuario("Aluno Lista", TipoUsuario.ALUNO);
        Usuario professorUsuario = salvarUsuario("Professor Lista", TipoUsuario.PROFESSOR);
        Professor professor = new Professor();
        professor.setUsuario(professorUsuario);
        professor = professorRepository.save(professor);

        String tokenAluno = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), false);
        mockMvc.perform(post("/denuncias")
                        .header("Authorization", "Bearer " + tokenAluno)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "denunciadoId":"%s",
                                  "motivo":"FRAUDE",
                                  "descricao":"Cobrança fora da plataforma combinada."
                                }
                                """.formatted(professorUsuario.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/denuncias").header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isForbidden());

        Usuario admin = usuarioRepository.save(Usuario.builder()
                .nomeCompleto("Admin Lista")
                .email("admin." + UUID.randomUUID() + "@conectapro.test")
                .tipo(TipoUsuario.ALUNO)
                .admin(true)
                .build());
        String tokenAdmin = jwtService.gerarToken(admin.getId(), admin.getTipo().name(), true);

        mockMvc.perform(get("/denuncias").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].denunciadoNome", hasItem("Professor Lista")))
                .andExpect(jsonPath("$[*].denunciante.nome", hasItem("Aluno Lista")))
                .andExpect(jsonPath("$[*].motivo", hasItem("FRAUDE")))
                .andExpect(jsonPath("$[*].status", hasItem("PENDENTE")));
    }

    private Usuario salvarUsuario(String nome, TipoUsuario tipo) {
        return usuarioRepository.save(Usuario.builder()
                .nomeCompleto(nome)
                .email(tipo.name().toLowerCase() + "." + UUID.randomUUID() + "@conectapro.test")
                .tipo(tipo)
                .build());
    }
}
