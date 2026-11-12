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

import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class LembreteAulaJob {

    private static final Logger logger = LoggerFactory.getLogger(LembreteAulaJob.class);

    static final ZoneId FUSO_AULA = ZoneId.of("America/Sao_Paulo");
    private static final String TITULO = "Lembrete de aula";
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("H:mm");

    private static final Map<String, DayOfWeek> DIAS = Map.ofEntries(
            Map.entry("seg", DayOfWeek.MONDAY),
            Map.entry("segunda", DayOfWeek.MONDAY),
            Map.entry("ter", DayOfWeek.TUESDAY),
            Map.entry("terca", DayOfWeek.TUESDAY),
            Map.entry("qua", DayOfWeek.WEDNESDAY),
            Map.entry("quarta", DayOfWeek.WEDNESDAY),
            Map.entry("qui", DayOfWeek.THURSDAY),
            Map.entry("quinta", DayOfWeek.THURSDAY),
            Map.entry("sex", DayOfWeek.FRIDAY),
            Map.entry("sexta", DayOfWeek.FRIDAY),
            Map.entry("sab", DayOfWeek.SATURDAY),
            Map.entry("sabado", DayOfWeek.SATURDAY),
            Map.entry("dom", DayOfWeek.SUNDAY),
            Map.entry("domingo", DayOfWeek.SUNDAY)
    );

    private static final Map<String, LocalTime> TURNOS = Map.of(
            "matutino", LocalTime.of(7, 0),
            "vespertino", LocalTime.of(13, 0),
            "noturno", LocalTime.of(19, 0)
    );

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

        Optional<OffsetDateTime> inicio = inicioDaProximaAula(agendamento, agora);
        if (inicio.isEmpty()) {
            return 0;
        }

        long horas = ChronoUnit.HOURS.between(truncarHora(agora), truncarHora(inicio.get()));
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

    private Optional<OffsetDateTime> inicioDaProximaAula(Agendamento agendamento, OffsetDateTime agora) {
        DayOfWeek dia = diaDe(agendamento.getDiaSemana());
        LocalTime hora = horaDe(agendamento.getHorario());
        if (dia == null || hora == null) {
            logger.warn("Agendamento sem dia ou horário interpretável. agendamentoId={} dia={} horario={}",
                    agendamento.getId(), agendamento.getDiaSemana(), agendamento.getHorario());
            return Optional.empty();
        }

        ZonedDateTime referencia = agora.atZoneSameInstant(FUSO_AULA);
        LocalDate data = referencia.toLocalDate();
        int delta = (dia.getValue() - data.getDayOfWeek().getValue() + 7) % 7;
        ZonedDateTime inicio = data.plusDays(delta).atTime(hora).atZone(FUSO_AULA);
        if (!inicio.toOffsetDateTime().isAfter(agora)) {
            inicio = inicio.plusWeeks(1);
        }
        return Optional.of(inicio.toOffsetDateTime());
    }

    private static OffsetDateTime truncarHora(OffsetDateTime instante) {
        return instante.atZoneSameInstant(FUSO_AULA).truncatedTo(ChronoUnit.HOURS).toOffsetDateTime();
    }

    private static String textoPrazo(long horas) {
        return horas == 1 ? "1 hora" : "24 horas";
    }

    private static DayOfWeek diaDe(String diaSemana) {
        if (diaSemana == null || diaSemana.isBlank()) {
            return null;
        }
        String chave = semAcento(diaSemana).replace("-feira", "").replace(" feira", "");
        return DIAS.get(chave);
    }

    private static LocalTime horaDe(String horario) {
        if (horario == null || horario.isBlank()) {
            return null;
        }
        String chave = semAcento(horario);
        LocalTime turno = TURNOS.get(chave);
        if (turno != null) {
            return turno;
        }
        try {
            return LocalTime.parse(chave, HORA);
        } catch (DateTimeParseException excecao) {
            return null;
        }
    }

    private static String semAcento(String valor) {
        String normalizado = Normalizer.normalize(valor.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        return normalizado.replaceAll("\\p{M}", "");
    }
}
