package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.pagamento.CheckoutResponse;
import com.grupo.tfc.conectapro.dto.pagamento.MercadoPagoNotificacaoDTO;
import com.grupo.tfc.conectapro.dto.pagamento.StatusPagamentoResponse;
import com.grupo.tfc.conectapro.service.MercadoPagoWebhookValidator;
import com.grupo.tfc.conectapro.service.PagamentoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoController.class);

    private final PagamentoService pagamentoService;
    private final MercadoPagoWebhookValidator webhookValidator;

    public PagamentoController(PagamentoService pagamentoService,
                               MercadoPagoWebhookValidator webhookValidator) {
        this.pagamentoService = pagamentoService;
        this.webhookValidator = webhookValidator;
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> criarCheckout() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(pagamentoService.criarCheckout(usuarioId));
    }

    @GetMapping("/status")
    public ResponseEntity<StatusPagamentoResponse> statusPagamento() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(pagamentoService.statusPagamento(usuarioId));
    }

    @PostMapping("/reembolso")
    public ResponseEntity<Map<String, String>> solicitarReembolso() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        pagamentoService.solicitarReembolso(usuarioId);
        return ResponseEntity.ok(Map.of("message", "Reembolso solicitado com sucesso."));
    }

    @PostMapping("/webhook/mercadopago")
    public ResponseEntity<Void> webhookMercadoPago(
            @RequestBody(required = false) MercadoPagoNotificacaoDTO notificacao,
            @RequestParam(value = "data.id", required = false) String dataId,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {

        if (notificacao == null || notificacao.getData() == null || notificacao.getData().getId() == null) {
            logger.warn("Notificação inválida recebida do Mercado Pago");
            return ResponseEntity.ok().build();
        }

        String idAssinatura = dataId != null ? dataId : notificacao.getData().getId();
        if (!webhookValidator.assinaturaValida(idAssinatura, xSignature, xRequestId)) {
            logger.warn("Webhook do Mercado Pago rejeitado por assinatura inválida");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"payment".equalsIgnoreCase(notificacao.getType())) {
            logger.info("Notificação ignorada. tipo={}", notificacao.getType());
            return ResponseEntity.ok().build();
        }

        try {
            pagamentoService.processarNotificacao(notificacao.getData().getId());
        } catch (Exception e) {
            logger.error("Erro ao processar notificação. paymentId={}: {}",
                    notificacao.getData().getId(), e.getMessage(), e);
        }

        return ResponseEntity.ok().build();
    }
}
