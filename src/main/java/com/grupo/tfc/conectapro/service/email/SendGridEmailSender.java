package com.grupo.tfc.conectapro.service.email;

import com.grupo.tfc.conectapro.config.EmailProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class SendGridEmailSender implements EmailSender {

    private static final String ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

    private final EmailProperties emailProperties;
    private final String apiKey;
    private final String fromName;
    private final RestClient restClient;

    public SendGridEmailSender(EmailProperties emailProperties,
                               @Value("${app.mail.sendgrid.api-key:}") String apiKey,
                               @Value("${app.mail.sendgrid.from-name:ConectaPro}") String fromName) {
        this.emailProperties = emailProperties;
        this.apiKey = apiKey;
        this.fromName = fromName;
        this.restClient = RestClient.create();
    }

    @Override
    public void enviar(String destinatario, String assunto, String corpo, boolean html) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SENDGRID_API_KEY não configurada");
        }

        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of("to", List.of(Map.of("email", destinatario)))),
                "from", Map.of("email", emailProperties.from(), "name", fromName),
                "subject", assunto,
                "content", List.of(Map.of(
                        "type", html ? "text/html" : "text/plain",
                        "value", corpo))
        );

        restClient.post()
                .uri(ENDPOINT)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }
}
