package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.pagamento.CheckoutResponse;
import com.grupo.tfc.conectapro.dto.pagamento.MercadoPagoNotificacaoDTO;
import com.grupo.tfc.conectapro.service.PagamentoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoController.class);

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> criarCheckout() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(pagamentoService.criarCheckout(usuarioId));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> statusPagamento() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        String status = pagamentoService.statusPagamento(usuarioId);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/webhook/mercadopago")
    public ResponseEntity<Void> webhookMercadoPago(
            @RequestBody(required = false) MercadoPagoNotificacaoDTO notificacao) {

        if (notificacao == null || notificacao.getData() == null || notificacao.getData().getId() == null) {
            logger.warn("Notificação inválida recebida do Mercado Pago");
            return ResponseEntity.ok().build();
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
