package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.MercadoPagoProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class MercadoPagoWebhookValidator {

    private static final Logger logger = LoggerFactory.getLogger(MercadoPagoWebhookValidator.class);
    private static final String HMAC_ALGORITMO = "HmacSHA256";

    private final MercadoPagoProperties properties;

    public MercadoPagoWebhookValidator(MercadoPagoProperties properties) {
        this.properties = properties;
    }

    public boolean assinaturaValida(String dataId, String xSignature, String xRequestId) {
        String segredo = properties.webhookSecret();
        if (segredo == null || segredo.isBlank()) {
            logger.warn("MERCADOPAGO_WEBHOOK_SECRET nao configurado. Validacao de assinatura ignorada.");
            return true;
        }

        if (xSignature == null || xSignature.isBlank() || dataId == null || dataId.isBlank()) {
            return false;
        }

        String ts = null;
        String hashRecebido = null;
        for (String parte : xSignature.split(",")) {
            String[] par = parte.split("=", 2);
            if (par.length != 2) {
                continue;
            }
            String chave = par[0].trim();
            String valor = par[1].trim();
            if ("ts".equals(chave)) {
                ts = valor;
            } else if ("v1".equals(chave)) {
                hashRecebido = valor;
            }
        }

        if (ts == null || hashRecebido == null) {
            return false;
        }

        String manifesto = "id:" + dataId.toLowerCase() + ";request-id:" + (xRequestId == null ? "" : xRequestId)
                + ";ts:" + ts + ";";

        String hashCalculado = calcularHmac(manifesto, segredo);
        if (hashCalculado == null) {
            return false;
        }

        boolean valido = MessageDigest.isEqual(
                hashCalculado.getBytes(StandardCharsets.UTF_8),
                hashRecebido.getBytes(StandardCharsets.UTF_8));
        if (!valido) {
            logger.warn("Assinatura do webhook do Mercado Pago nao confere. dataId={}", dataId);
        }
        return valido;
    }

    private String calcularHmac(String manifesto, String segredo) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITMO);
            mac.init(new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITMO));
            byte[] bytes = mac.doFinal(manifesto.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                hex.append(Character.forDigit((b >> 4) & 0xF, 16));
                hex.append(Character.forDigit(b & 0xF, 16));
            }
            return hex.toString();
        } catch (Exception e) {
            logger.error("Falha ao calcular HMAC do webhook: {}", e.getMessage());
            return null;
        }
    }
}
