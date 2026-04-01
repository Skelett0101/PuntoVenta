package com.mx.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.service.*;

@RestController
@RequestMapping("/api/venta")
@CrossOrigin
public class VentaController {
	
	 @Autowired
	    private VentaService venta;

	    @PostMapping("/")
	    public void agregar(
	        @RequestParam Long id_Venta,
	        @RequestParam Long id_usuario,
	        @RequestParam String nombreVenta,
	        @RequestParam String fecha,
	        @RequestParam String hora_venta,
	        @RequestParam double subtotal,
	        @RequestParam double total
	    ){
	    	//venta.(id_Venta, id_usuario, nombreVenta, fecha, hora_venta, subtotal, total);
	    }

	}

