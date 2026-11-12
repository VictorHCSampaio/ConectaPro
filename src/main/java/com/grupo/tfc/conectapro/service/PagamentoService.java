package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.client.MercadoPagoClient;
import com.grupo.tfc.conectapro.dto.pagamento.CheckoutResponse;
import com.grupo.tfc.conectapro.model.Pagamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.StatusPagamento;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.PagamentoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PagamentoService {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoService.class);
    private static final BigDecimal VALOR_ASSINATURA = new BigDecimal("29.90");

    private final MercadoPagoClient mercadoPagoClient;
    private final PagamentoRepository pagamentoRepository;
    private final UsuarioRepository usuarioRepository;

    public PagamentoService(MercadoPagoClient mercadoPagoClient,
                            PagamentoRepository pagamentoRepository,
                            UsuarioRepository usuarioRepository) {
        this.mercadoPagoClient = mercadoPagoClient;
        this.pagamentoRepository = pagamentoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public CheckoutResponse criarCheckout(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
            throw new ResponseStatusException(BAD_REQUEST, "Apenas professores precisam efetuar o pagamento");
        }

        if (usuario.getStatusConta() == StatusConta.ATIVO) {
            throw new ResponseStatusException(BAD_REQUEST, "Pagamento já foi efetuado");
        }

        String referencia = "PROF-" + usuarioId;

        CheckoutResponse checkout = mercadoPagoClient.criarPreferencia(
                usuario.getEmail(),
                usuario.getNomeCompleto(),
                referencia
        );

        Pagamento pagamento = Pagamento.builder()
                .usuarioId(usuarioId)
                .mercadoPagoPreferenceId(checkout.preferenceId())
                .valor(VALOR_ASSINATURA)
                .status(StatusPagamento.PENDENTE)
                .build();
        pagamentoRepository.save(pagamento);

        logger.info("Checkout criado. usuarioId={} preferenceId={}", usuarioId, checkout.preferenceId());

        return checkout;
    }

    public void processarNotificacao(String paymentId) {
        MercadoPagoClient.DetalhesPagamento detalhes = mercadoPagoClient.buscarDetalhesPagamento(paymentId);

        logger.info("Notificação recebida. paymentId={} status={} referencia={}",
                paymentId, detalhes.status(), detalhes.referenciaExterna());

        if (detalhes.referenciaExterna() == null || !detalhes.referenciaExterna().startsWith("PROF-")) {
            logger.warn("Referência externa inválida: {}", detalhes.referenciaExterna());
            return;
        }

        UUID usuarioId = UUID.fromString(detalhes.referenciaExterna().substring(5));

        pagamentoRepository.findTopByUsuarioIdOrderByCriadoEmDesc(usuarioId).ifPresent(pagamento -> {
            pagamento.setMercadoPagoPaymentId(paymentId);
            pagamento.setStatus(detalhes.status());
            pagamento.setStatusDetalhe(detalhes.statusDetalhe());
            pagamento.setMetodoPagamento(detalhes.metodoPagamento());
            pagamentoRepository.save(pagamento);
        });

        if (detalhes.status() == StatusPagamento.APROVADO) {
            usuarioRepository.findById(usuarioId).ifPresent(usuario -> {
                usuario.setStatusConta(StatusConta.ATIVO);
                usuarioRepository.save(usuario);
                logger.info("Conta ativada após pagamento. usuarioId={}", usuarioId);
            });
        }
    }

    public String statusPagamento(UUID usuarioId) {
        return pagamentoRepository.findTopByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .map(p -> p.getStatus().name())
                .orElse("SEM_PAGAMENTO");
    }
}
