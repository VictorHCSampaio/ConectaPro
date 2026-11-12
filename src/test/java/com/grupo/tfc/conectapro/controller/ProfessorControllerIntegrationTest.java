package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProfessorControllerIntegrationTest {

    private static final String EMAIL_PROFESSOR_IT = "professor.it@conectapro.com";
    private static final String EMAIL_ALUNO_IT    = "aluno.it@conectapro.com";

    @Autowired private WebApplicationContext webApplicationContext;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ProfessorRepository professorRepository;
    @Autowired private ProfessorMateriaRepository professorMateriaRepository;
    @Autowired private ProfessorDisponibilidadeRepository disponibilidadeRepository;
    @Autowired private EnderecoRepository enderecoRepository;
    @Autowired private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        limparDadosDeTeste(EMAIL_PROFESSOR_IT);
        limparDadosDeTeste(EMAIL_ALUNO_IT);
    }


    // Cenário 1 — Fluxo Completo: PUT /professores/me cria perfil no banco H2


    @Test
    void deveSalvarPerfilEAtualizarBancoQuandoTokenForDeProfessor() throws Exception {
        // Arrange
        Usuario professor = usuarioRepository.save(Usuario.builder()
                .nomeCompleto("Professor Integração")
                .email(EMAIL_PROFESSOR_IT)
                .tipo(TipoUsuario.PROFESSOR)
                .build());

        String token = jwtService.gerarToken(professor.getId(), professor.getTipo().name(), professor.isAdmin());

        // Act
        mockMvc.perform(put("/professores/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(buildPerfilPayload())
                        .header("Authorization", "Bearer " + token))

                // Assert — resposta HTTP
                .andExpect(status().isOk());

        // Assert — perfil persistido no banco H2
        assertThat(professorRepository.findByUsuarioId(professor.getId())).isPresent();
    }


    // Cenário 2 — Regra de Negócio: aluno recebe 403 e banco não é alterado


    @Test
    void deveRetornarForbiddenQuandoTokenForDeAluno() throws Exception {
        // Arrange
        Usuario aluno = usuarioRepository.save(Usuario.builder()
                .nomeCompleto("Aluno Integração")
                .email(EMAIL_ALUNO_IT)
                .tipo(TipoUsuario.ALUNO)
                .build());

        String token = jwtService.gerarToken(aluno.getId(), aluno.getTipo().name(), aluno.isAdmin());

        // Act + Assert — resposta HTTP
        mockMvc.perform(put("/professores/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(buildPerfilPayload())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // Assert — nenhum perfil de professor criado no banco
        assertThat(professorRepository.findByUsuarioId(aluno.getId())).isEmpty();
    }


    // Helpers privados


    private void limparDadosDeTeste(String email) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            professorRepository.findByUsuarioId(usuario.getId()).ifPresent(professor -> {
                professorMateriaRepository.deleteByProfessorId(professor.getId());
                disponibilidadeRepository.deleteByProfessorId(professor.getId());
                enderecoRepository.findFirstByUsuarioId(usuario.getId())
                        .ifPresent(enderecoRepository::delete);
                professorRepository.delete(professor);
            });
            usuarioRepository.delete(usuario);
        });
    }

    private String buildPerfilPayload() {
        return """
                {
                  "fullName": "Professor Integração Teste",
                  "phone": "(11) 99999-9999",
                  "bio": "Esta é uma biografia de teste com mais de cinquenta caracteres obrigatórios para validação do campo.",
                  "subjects": [
                    { "name": "Matemática", "observation": null, "level": "BASICO" }
                  ],
                  "teachingModel": "PARTICULARES",
                  "modalities": ["ONLINE"],
                  "pricePerHour": 150.0,
                  "address": {
                    "cep": "01310100",
                    "street": "Av. Paulista",
                    "neighborhood": "Bela Vista",
                    "city": "São Paulo",
                    "state": "SP"
                  },
                  "availability": [
                    { "day": "seg", "time": "08:00" }
                  ]
                }
                """;
    }
}
