package com.mx.ubam.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.*;

@Entity
@Table(name = "Lote")
public class Lote {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Long idLote;

	@ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "codigo_lote", length = 15, unique = true, nullable = false)
    private String codigoLote;
    
    @Column(name = "fecha_ingreso", nullable =false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaIngreso;
    
    @Column(name = "fecha_caducidad", nullable =false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaCaducidad;
    
    @Column(name = "stock_lote", nullable = false)
    private Long stockLote;
    
    public Lote() {}

    
  //GETTERS Y SETTERS
    
    
	public Long getIdLote() {
		return idLote;
	}

	public void setIdLote(Long idLote) {
		this.idLote = idLote;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public String getCodigoLote() {
		return codigoLote;
	}

	public void setCodigoLote(String codigoLote) {
		this.codigoLote = codigoLote;
	}

	public LocalDate getFechaIngreso() {
		return fechaIngreso;
	}

	public void setFechaIngreso(LocalDate fechaIngreso) {
		this.fechaIngreso = fechaIngreso;
	}

	public LocalDate getFechaCaducidad() {
		return fechaCaducidad;
	}

	public void setFechaCaducidad(LocalDate fechaCaducidad) {
		this.fechaCaducidad = fechaCaducidad;
	}


	public Long getStockLote() {
		return stockLote;
	}


	public void setStockLote(Long stockLote) {
		this.stockLote = stockLote;
	}
    
    
    
    
    
    
    

}
