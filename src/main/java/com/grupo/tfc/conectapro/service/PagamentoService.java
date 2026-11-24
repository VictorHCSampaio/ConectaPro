package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.client.MercadoPagoClient;
import com.grupo.tfc.conectapro.dto.pagamento.CheckoutResponse;
import com.grupo.tfc.conectapro.dto.pagamento.StatusPagamentoResponse;
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
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class PagamentoService {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoService.class);
    private static final BigDecimal VALOR_ASSINATURA = new BigDecimal("1.00");
    private static final int DIAS_VALIDADE_ASSINATURA = 30;
    private static final int DIAS_LIMITE_REEMBOLSO = 7;

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

        if (usuario.getStatusConta() != StatusConta.PENDENTE_PAGAMENTO
                && usuario.getStatusConta() != StatusConta.ATIVO) {
            throw new ResponseStatusException(FORBIDDEN, "Aguarde a aprovação do seu cadastro para efetuar o pagamento");
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
                usuario.setAssinaturaValidaAte(novaValidade(usuario));
                usuarioRepository.save(usuario);
                logger.info("Assinatura ativada/renovada. usuarioId={} validaAte={}",
                        usuarioId, usuario.getAssinaturaValidaAte());
            });
        } else if (detalhes.status() == StatusPagamento.REEMBOLSADO) {
            usuarioRepository.findById(usuarioId).ifPresent(this::revogarAssinatura);
        }
    }

    private OffsetDateTime novaValidade(Usuario usuario) {
        OffsetDateTime agora = OffsetDateTime.now();
        OffsetDateTime base = usuario.getAssinaturaValidaAte() != null
                && usuario.getAssinaturaValidaAte().isAfter(agora)
                ? usuario.getAssinaturaValidaAte()
                : agora;
        return base.plusDays(DIAS_VALIDADE_ASSINATURA);
    }

    private void revogarAssinatura(Usuario usuario) {
        usuario.setStatusConta(StatusConta.PENDENTE_PAGAMENTO);
        usuario.setAssinaturaValidaAte(null);
        usuarioRepository.save(usuario);
        logger.info("Assinatura revogada (reembolso). usuarioId={}", usuario.getId());
    }

    public void solicitarReembolso(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Pagamento pagamento = pagamentoRepository
                .findTopByUsuarioIdAndStatusOrderByCriadoEmDesc(usuarioId, StatusPagamento.APROVADO)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nenhum pagamento aprovado para reembolsar"));

        if (pagamento.getMercadoPagoPaymentId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Pagamento sem identificador do Mercado Pago");
        }

        OffsetDateTime limite = pagamento.getCriadoEm() == null
                ? OffsetDateTime.now()
                : pagamento.getCriadoEm().plusDays(DIAS_LIMITE_REEMBOLSO);
        if (OffsetDateTime.now().isAfter(limite)) {
            throw new ResponseStatusException(FORBIDDEN,
                    "O prazo de " + DIAS_LIMITE_REEMBOLSO + " dias para reembolso já expirou");
        }

        mercadoPagoClient.reembolsar(pagamento.getMercadoPagoPaymentId());

        pagamento.setStatus(StatusPagamento.REEMBOLSADO);
        pagamentoRepository.save(pagamento);

        revogarAssinatura(usuario);
        logger.info("Reembolso efetuado. usuarioId={} paymentId={}", usuarioId, pagamento.getMercadoPagoPaymentId());
    }

    public StatusPagamentoResponse statusPagamento(UUID usuarioId) {
        String status = pagamentoRepository.findTopByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .map(p -> p.getStatus().name())
                .orElse("SEM_PAGAMENTO");

        OffsetDateTime validade = usuarioRepository.findById(usuarioId)
                .map(Usuario::getAssinaturaValidaAte)
                .orElse(null);

        return new StatusPagamentoResponse(status, validade, reembolsoDisponivel(usuarioId));
    }

    private boolean reembolsoDisponivel(UUID usuarioId) {
        return pagamentoRepository
                .findTopByUsuarioIdAndStatusOrderByCriadoEmDesc(usuarioId, StatusPagamento.APROVADO)
                .filter(p -> p.getMercadoPagoPaymentId() != null)
                .map(p -> p.getCriadoEm() == null
                        || OffsetDateTime.now().isBefore(p.getCriadoEm().plusDays(DIAS_LIMITE_REEMBOLSO)))
                .orElse(false);
    }
}
