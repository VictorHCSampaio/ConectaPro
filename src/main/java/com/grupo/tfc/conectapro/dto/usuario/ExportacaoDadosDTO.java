package com.grupo.tfc.conectapro.dto.usuario;

import java.time.OffsetDateTime;
import java.util.List;

public record ExportacaoDadosDTO(
        DadosPessoais dadosPessoais,
        EnderecoExport endereco,
        List<AgendamentoExport> agendamentos,
        List<MensagemExport> mensagens,
        List<AvaliacaoExport> avaliacoesFeitas,
        List<AvaliacaoExport> avaliacoesRecebidas,
        List<DenunciaExport> denuncias,
        List<NotificacaoExport> notificacoes
) {

    public record DadosPessoais(
            String id,
            String nomeCompleto,
            String email,
            String tipo,
            String statusConta,
            String biografia,
            String avatarUrl,
            OffsetDateTime criadoEm
    ) {}

    public record EnderecoExport(
            String cep,
            String logradouro,
            String bairro,
            String cidade,
            String estado
    ) {}

    public record AgendamentoExport(
            String id,
            String professorNome,
            String alunoNome,
            String materia,
            String modalidade,
            String status,
            OffsetDateTime dataHoraInicio,
            OffsetDateTime criadoEm
    ) {}

    public record MensagemExport(
            String remetenteNome,
            String destinatarioNome,
            String conteudo,
            OffsetDateTime dataEnvio
    ) {}

    public record AvaliacaoExport(
            String avaliadorNome,
            String avaliadoNome,
            int nota,
            String comentario,
            OffsetDateTime criadoEm
    ) {}

    public record DenunciaExport(
            String papel,
            String motivo,
            String descricao,
            String status,
            OffsetDateTime dataCriacao
    ) {}

    public record NotificacaoExport(
            String titulo,
            String mensagem,
            String tipo,
            boolean lida,
            OffsetDateTime dataCriacao
    ) {}
}
