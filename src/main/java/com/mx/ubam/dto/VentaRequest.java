package com.mx.ubam.dto;

import java.util.List;

public class VentaRequest {
    
    private Long idUsuario;
    private String nombreVenta; 
    private List<ItemDetalleDTO> items;

    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNombreVenta() { return nombreVenta; }
    public void setNombreVenta(String nombreVenta) { this.nombreVenta = nombreVenta; }

    public List<ItemDetalleDTO> getItems() { return items; }
    public void setItems(List<ItemDetalleDTO> items) { this.items = items; }

    public static class ItemDetalleDTO {
        private Integer idProducto;
        private Integer cantidad;

        // Getters y Setters
        public Integer getIdProducto() { return idProducto; }
        public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}