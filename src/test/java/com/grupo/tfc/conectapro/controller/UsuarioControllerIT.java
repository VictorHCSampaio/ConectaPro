package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class UsuarioControllerIT {

    private static final String EMAIL_REGISTRO = "integracao.register@conectapro.com";

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .build();

        usuarioRepository.findByEmail(EMAIL_REGISTRO)
                .ifPresent(usuarioRepository::delete);
    }

    // Cenário 1 — Caminho Feliz: POST /auth/register persiste usuário no banco
    

    @Test
    void deveRetornar200ECriarUsuarioQuandoPayloadValido() throws Exception {
        // Arrange
        String payload = """
                {
                  "nome": "Usuário de Integração",
                  "email": "%s",
                  "password": "senha@123"
                }
                """.formatted(EMAIL_REGISTRO);

        // Act
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))

                // Assert — resposta HTTP
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.qrUri").isNotEmpty());

        // Assert — persistência no banco H2
        assertThat(usuarioRepository.findByEmail(EMAIL_REGISTRO)).isPresent();
    }

    
    // Cenário 2 — Erro 4xx: e-mail em branco dispara Bean Validation
    

    @Test
    void deveRetornarErroQuandoEmailInvalidoOuDuplicado() throws Exception {
        // Arrange
        String payloadEmailEmBranco = """
                {
                  "nome": "Usuário Inválido",
                  "email": "",
                  "password": "senha@123"
                }
                """;

        // Act + Assert
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadEmailEmBranco))
                .andExpect(status().isBadRequest());
    }
}
