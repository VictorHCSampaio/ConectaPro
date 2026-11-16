package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.AwsS3Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class ArmazenamentoS3Service {

    private static final Logger logger = LoggerFactory.getLogger(ArmazenamentoS3Service.class);

    private static final long TAMANHO_MAXIMO_BYTES = 5L * 1024 * 1024;
    private static final String PREFIXO_AVATAR = "avatars/";
    private static final String PREFIXO_CERTIFICADO = "certificados/";
    private static final Duration VALIDADE_LINK_CERTIFICADO = Duration.ofMinutes(15);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AwsS3Properties properties;

    public ArmazenamentoS3Service(S3Client s3Client, S3Presigner s3Presigner, AwsS3Properties properties) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.properties = properties;
    }

    public String enviarAvatar(UUID professorId, MultipartFile arquivo) {
        byte[] conteudo = lerConteudo(arquivo);
        String contentType = detectarImagem(conteudo, true);
        String chave = PREFIXO_AVATAR + professorId;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(properties.bucket())
                        .key(chave)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(conteudo));

        logger.info("Avatar enviado para o S3. professorId={} chave={} tipo={}", professorId, chave, contentType);
        return urlPublica(chave);
    }

    public void removerAvatar(UUID professorId) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(properties.bucket())
                .key(PREFIXO_AVATAR + professorId)
                .build());
        logger.info("Avatar removido do S3. professorId={}", professorId);
    }

    public void enviarCertificado(UUID professorId, MultipartFile arquivo) {
        byte[] conteudo = lerConteudo(arquivo);
        String contentType = detectarImagem(conteudo, false);
        String chave = PREFIXO_CERTIFICADO + professorId;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(properties.bucketCertificados())
                        .key(chave)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(conteudo));

        logger.info("Certificado enviado para o S3. professorId={} tipo={}", professorId, contentType);
    }

    public String gerarUrlCertificado(UUID professorId) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucketCertificados())
                .key(PREFIXO_CERTIFICADO + professorId)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(VALIDADE_LINK_CERTIFICADO)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private byte[] lerConteudo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Nenhum arquivo enviado");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_BYTES) {
            throw new ResponseStatusException(BAD_REQUEST, "O arquivo deve ter no maximo 5 MB");
        }
        try {
            return arquivo.getBytes();
        } catch (IOException e) {
            logger.error("Falha ao ler o arquivo enviado.", e);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Nao foi possivel ler o arquivo");
        }
    }

    private String detectarImagem(byte[] b, boolean permitirWebp) {
        if (ehPng(b)) {
            return "image/png";
        }
        if (ehJpeg(b)) {
            return "image/jpeg";
        }
        if (permitirWebp && ehWebp(b)) {
            return "image/webp";
        }
        String formatos = permitirWebp ? "PNG, JPG ou WEBP" : "PNG ou JPG";
        throw new ResponseStatusException(BAD_REQUEST, "Envie uma imagem nos formatos " + formatos);
    }

    private boolean ehPng(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0x89 && (b[1] & 0xFF) == 0x50
                && (b[2] & 0xFF) == 0x4E && (b[3] & 0xFF) == 0x47
                && (b[4] & 0xFF) == 0x0D && (b[5] & 0xFF) == 0x0A
                && (b[6] & 0xFF) == 0x1A && (b[7] & 0xFF) == 0x0A;
    }

    private boolean ehJpeg(byte[] b) {
        return b.length >= 3
                && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
    }

    private boolean ehWebp(byte[] b) {
        return b.length >= 12
                && (b[0] & 0xFF) == 0x52 && (b[1] & 0xFF) == 0x49
                && (b[2] & 0xFF) == 0x46 && (b[3] & 0xFF) == 0x46
                && (b[8] & 0xFF) == 0x57 && (b[9] & 0xFF) == 0x45
                && (b[10] & 0xFF) == 0x42 && (b[11] & 0xFF) == 0x50;
    }

    private String urlPublica(String chave) {
        String base;
        if (properties.publicBaseUrl() != null && !properties.publicBaseUrl().isBlank()) {
            base = properties.publicBaseUrl().replaceAll("/+$", "") + "/" + chave;
        } else {
            base = "https://" + properties.bucket() + ".s3." + properties.region() + ".amazonaws.com/" + chave;
        }
        return base + "?v=" + System.currentTimeMillis();
    }
}
