package com.grupo.tfc.conectapro.dto.professor;

public record StatusCadastroResponse(
        String status,
        boolean certificadoEnviado,
        String certificadoNome,
        String justificativaSemCertificado,
        String motivoRejeicao,
        boolean solicitarConversaAdmin,
        boolean comprovacaoPendente
) {
}
