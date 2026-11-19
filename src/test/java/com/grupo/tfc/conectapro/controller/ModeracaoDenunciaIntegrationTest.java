package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.EmailService;
import com.grupo.tfc.conectapro.service.JwtService;
import com.grupo.tfc.conectapro.service.ModeracaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ModeracaoDenunciaIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private NotificacaoRepository notificacaoRepository;
    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private EmailService emailService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void moderacao_exigeAdmin_baneTimeoutERecomendaBoletim() throws Exception {
        Usuario denunciante = salvar("Aluno Autor", TipoUsuario.ALUNO, false);
        Usuario acusado = salvar("Professor Acusado", TipoUsuario.PROFESSOR, false);
        Usuario admin = salvar("Admin Moderacao", TipoUsuario.ALUNO, true);
        String tokenDenunciante = jwtService.gerarToken(denunciante.getId(), denunciante.getTipo().name(), false);
        String tokenAcusado = jwtService.gerarToken(acusado.getId(), acusado.getTipo().name(), false);
        String tokenAdmin = jwtService.gerarToken(admin.getId(), admin.getTipo().name(), true);

        String corpoDenuncia = """
                {"denunciadoId":"%s","motivo":"ASSEDIO","descricao":"Conduta grave durante a aula online."}
                """.formatted(acusado.getId());
        MvcResult criada = mockMvc.perform(post("/denuncias")
                        .header("Authorization", "Bearer " + tokenDenunciante)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoDenuncia))
                .andExpect(status().isCreated())
                .andReturn();
        String denunciaId = com.jayway.jsonpath.JsonPath.read(criada.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(post("/admin/usuarios/" + acusado.getId() + "/ban"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/admin/usuarios/" + acusado.getId() + "/ban")
                        .header("Authorization", "Bearer " + tokenDenunciante))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/admin/denuncias/" + denunciaId + "/recomendar-bo")
                        .header("Authorization", "Bearer " + tokenDenunciante))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/admin/usuarios/" + acusado.getId() + "/ban")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusConta").value("BANIDO"));

        mockMvc.perform(get("/chat/conversas").header("Authorization", "Bearer " + tokenAcusado))
                .andExpect(status().isUnauthorized());

        Usuario outro = salvar("Aluno Timeout", TipoUsuario.ALUNO, false);
        String tokenOutro = jwtService.gerarToken(outro.getId(), outro.getTipo().name(), false);
        mockMvc.perform(post("/admin/usuarios/" + outro.getId() + "/timeout")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"horas\":24}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloqueadoAte").isNotEmpty());
        mockMvc.perform(get("/chat/conversas").header("Authorization", "Bearer " + tokenOutro))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/admin/denuncias/" + denunciaId + "/recomendar-bo")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENCAMINHADA"));

        verify(emailService).enviarRecomendacaoBoletim(
                org.mockito.ArgumentMatchers.eq(denunciante.getEmail()),
                org.mockito.ArgumentMatchers.eq("Aluno Autor"),
                org.mockito.ArgumentMatchers.eq(ModeracaoService.TEXTO_BO));
        assertThat(notificacaoRepository.findByUsuarioIdOrderByDataCriacaoDesc(denunciante.getId()))
                .anyMatch(notificacao -> ModeracaoService.TEXTO_BO.equals(notificacao.getMensagem()));

        mockMvc.perform(patch("/admin/denuncias/" + denunciaId + "/status")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"ARQUIVADA","notasModeracao":"Caso encerrado após revisão interna."}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARQUIVADA"))
                .andExpect(jsonPath("$.notasModeracao").value("Caso encerrado após revisão interna."));

        assertThat(usuarioRepository.findById(acusado.getId()).orElseThrow().getStatusConta())
                .isEqualTo(StatusConta.BANIDO);
    }

    private Usuario salvar(String nome, TipoUsuario tipo, boolean admin) {
        return usuarioRepository.save(Usuario.builder()
                .nomeCompleto(nome)
                .email(tipo.name().toLowerCase() + "." + UUID.randomUUID() + "@conectapro.test")
                .tipo(tipo)
                .admin(admin)
                .build());
    }
}
