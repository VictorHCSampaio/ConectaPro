package com.grupo.tfc.conectapro.job;

import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
import com.grupo.tfc.conectapro.service.NotificacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Component
public class LembreteAulaJob {

    private static final Logger logger = LoggerFactory.getLogger(LembreteAulaJob.class);

    static final ZoneId FUSO_AULA = ZoneId.of("America/Sao_Paulo");
    private static final String TITULO = "Lembrete de aula";

    private final AgendamentoRepository agendamentoRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final NotificacaoService notificacaoService;

    public LembreteAulaJob(AgendamentoRepository agendamentoRepository,
                           NotificacaoRepository notificacaoRepository,
                           NotificacaoService notificacaoService) {
        this.agendamentoRepository = agendamentoRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.notificacaoService = notificacaoService;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void enviarLembretes() {
        enviarLembretes(OffsetDateTime.now(FUSO_AULA));
    }

    void enviarLembretes(OffsetDateTime agora) {
        var confirmados = agendamentoRepository.buscarPorStatusComParticipantes(StatusAgendamento.CONFIRMADO);
        int enviados = 0;
        for (Agendamento agendamento : confirmados) {
            try {
                enviados += lembrarSeNoPrazo(agendamento, agora);
            } catch (RuntimeException excecao) {
                logger.error("Falha ao gerar lembrete de aula. agendamentoId={}", agendamento.getId(), excecao);
            }
        }
        logger.info("Lembretes de aula processados. confirmados={} enviados={}", confirmados.size(), enviados);
    }

    private int lembrarSeNoPrazo(Agendamento agendamento, OffsetDateTime agora) {
        if (agendamento.getStatus() != StatusAgendamento.CONFIRMADO) {
            return 0;
        }

        OffsetDateTime inicio = agendamento.getDataHoraInicio();
        if (inicio == null || !inicio.isAfter(agora)) {
            return 0;
        }

        long horas = ChronoUnit.HOURS.between(truncarHora(agora), truncarHora(inicio));
        if (horas != 24 && horas != 1) {
            return 0;
        }

        String mensagem = "Você tem uma aula de " + agendamento.getMateria() + " em " + textoPrazo(horas) + "!";
        int enviados = 0;
        enviados += notificar(agendamento.getAluno(), mensagem, agora);
        if (agendamento.getProfessor() != null) {
            enviados += notificar(agendamento.getProfessor().getUsuario(), mensagem, agora);
        }
        return enviados;
    }

    private int notificar(Usuario usuario, String mensagem, OffsetDateTime agora) {
        if (usuario == null || usuario.getId() == null) {
            return 0;
        }
        boolean jaEnviada = notificacaoRepository.existsByUsuarioIdAndTipoAndMensagemAndDataCriacaoAfter(
                usuario.getId(), TipoNotificacao.AULA_LEMBRETE, mensagem, agora.minusHours(2));
        if (jaEnviada) {
            return 0;
        }
        notificacaoService.criarNotificacao(usuario, TITULO, mensagem, TipoNotificacao.AULA_LEMBRETE);
        return 1;
    }

    private static OffsetDateTime truncarHora(OffsetDateTime instante) {
        return instante.atZoneSameInstant(FUSO_AULA).truncatedTo(ChronoUnit.HOURS).toOffsetDateTime();
    }

    private static String textoPrazo(long horas) {
        return horas == 1 ? "1 hora" : "24 horas";
    }
}
