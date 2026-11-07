package com.grupo.tfc.conectapro.client;

import com.grupo.tfc.conectapro.config.MercadoPagoProperties;
import com.grupo.tfc.conectapro.dto.pagamento.CheckoutResponse;
import com.grupo.tfc.conectapro.model.StatusPagamento;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class MercadoPagoClient {

    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoClient.class);

    private final MercadoPagoProperties properties;

    public MercadoPagoClient(MercadoPagoProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    public void init() {
        String token = properties.accessToken() != null ? properties.accessToken().trim() : null;
        logger.info("Mercado Pago SDK inicializado. Token presente={} prefixo={}",
                token != null && !token.isBlank(),
                token != null && token.length() > 10 ? token.substring(0, 10) + "..." : "VAZIO");
        MercadoPagoConfig.setAccessToken(token);
    }

    public CheckoutResponse criarPreferencia(String email, String nome, String referencia) {
        try {
            PreferenceClient client = new PreferenceClient();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id("assinatura-professor")
                    .title("Assinatura ConectaPro - Professor")
                    .description("Assinatura para professores na plataforma ConectaPro")
                    .quantity(1)
                    .currencyId("BRL")
                    .unitPrice(new BigDecimal("29.90"))
                    .build();

            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .email(email)
                    .name(nome)
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(properties.urlSucesso())
                    .failure(properties.urlFalha())
                    .pending(properties.urlPendente())
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(List.of(item))
                    .payer(payer)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(referencia)
                    .build();

            Preference preference = client.create(request);

            logger.info("Preferência criada. id={} initPoint={}", preference.getId(), preference.getInitPoint());

            String url = properties.sandbox() ? preference.getSandboxInitPoint() : preference.getInitPoint();
            return new CheckoutResponse(preference.getId(), url);

        } catch (MPApiException e) {
            String content = e.getApiResponse() != null ? e.getApiResponse().getContent() : "sem resposta";
            logger.error("Erro na API do Mercado Pago: status={} resposta={} message={}",
                    e.getStatusCode(), content, e.getMessage(), e);
            throw new RuntimeException("Erro na API do Mercado Pago [" + e.getStatusCode() + "]: " + content, e);
        } catch (MPException e) {
            logger.error("Erro no SDK do Mercado Pago: {}", e.getMessage(), e);
            throw new RuntimeException("Erro no SDK do Mercado Pago: " + e.getMessage(), e);
        }
    }

    public DetalhesPagamento buscarDetalhesPagamento(String paymentId) {
        try {
            PaymentClient client = new PaymentClient();
            com.mercadopago.resources.payment.Payment mpPayment = client.get(Long.parseLong(paymentId));

            StatusPagamento status = mapearStatus(mpPayment.getStatus());
            String metodo = mpPayment.getPaymentMethodId();
            String referencia = mpPayment.getExternalReference();

            return new DetalhesPagamento(paymentId, referencia, status, mpPayment.getStatusDetail(), metodo);

        } catch (MPApiException e) {
            logger.error("Erro ao buscar pagamento {}: status={}", paymentId, e.getStatusCode(), e);
            throw new RuntimeException("Erro ao buscar detalhes do pagamento", e);
        } catch (MPException e) {
            logger.error("Erro no SDK ao buscar pagamento {}: {}", paymentId, e.getMessage(), e);
            throw new RuntimeException("Erro no SDK do Mercado Pago", e);
        }
    }

    private StatusPagamento mapearStatus(String status) {
        if (status == null) return StatusPagamento.DESCONHECIDO;
        return switch (status.toLowerCase()) {
            case "approved" -> StatusPagamento.APROVADO;
            case "pending", "in_process", "in_mediation", "authorized" -> StatusPagamento.EM_PROCESSAMENTO;
            case "rejected" -> StatusPagamento.REJEITADO;
            case "cancelled" -> StatusPagamento.CANCELADO;
            case "refunded", "charged_back" -> StatusPagamento.REEMBOLSADO;
            default -> StatusPagamento.DESCONHECIDO;
        };
    }

    public record DetalhesPagamento(
            String paymentId,
            String referenciaExterna,
            StatusPagamento status,
            String statusDetalhe,
            String metodoPagamento
    ) {}
}
