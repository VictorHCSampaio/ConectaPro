package com.grupo.tfc.conectapro.dto.pagamento;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MercadoPagoNotificacaoDTO {

    private String action;

    @JsonProperty("api_version")
    private String apiVersion;

    private NotificacaoData data;

    @JsonProperty("date_created")
    private String dateCreated;

    private long id;

    @JsonProperty("live_mode")
    private boolean liveMode;

    private String type;

    @JsonProperty("user_id")
    private long userId;

    @Data
    @NoArgsConstructor
    public static class NotificacaoData {
        private String id;
    }
}
