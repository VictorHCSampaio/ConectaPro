package com.grupo.tfc.conectapro.dto.agendamento;

public record HorarioDisponivelResponse(
        String day,
        String time,
        boolean available
) {
}
