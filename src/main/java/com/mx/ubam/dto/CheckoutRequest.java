package com.mx.ubam.dto;

public class CheckoutRequest {
	
	// IDs Principales
    private Long id_Venta;
    private Long id_usuario;
    private Long id_lote;
    private Long id_producto;
    private Long id_item_venta;
    
    // Datos de Dirección
    private String calleDireccion;
    private String numeroDireccion;
    private String cpDireccion;
    private String ciudadDireccion;
    private String estadoDireccion;

    // Datos de Tarjeta
    private String titular;
    private String numeroTarjeta;
    private String fechaExpiracion;

}
