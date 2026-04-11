package com.mx.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.dto.VentaRequest;
import com.mx.ubam.model.Ventas;
import com.mx.ubam.service.VentaService;

@RestController
@RequestMapping("/api/venta")
@CrossOrigin 
public class VentaController {
    
    @Autowired
    private VentaService ventaService;

    
    @PostMapping("/confirmar")
    public ResponseEntity<?> registrarVenta(@RequestBody VentaRequest request) {
        try {
        	
            Ventas nuevaVenta = ventaService.procesarVenta(request);
            
            return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
        	
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            
        } catch (Exception e) {
        	
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Ocurrió un error inesperado al procesar la venta.");
        }
    }
}