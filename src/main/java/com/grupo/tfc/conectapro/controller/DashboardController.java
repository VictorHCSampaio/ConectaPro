package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.DashboardResumoDTO;
import com.grupo.tfc.conectapro.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<Void> acessar() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/resumo")
    public ResponseEntity<DashboardResumoDTO> resumo(@RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(dashboardService.resumo(dias));
    }
}
