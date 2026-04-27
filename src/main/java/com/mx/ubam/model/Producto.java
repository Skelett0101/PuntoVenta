package com.mx.ubam.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name = "producto")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_producto; // 🔥 CAMBIO IMPORTANTE

    @Column(name = "nombre_producto", length = 150, nullable = false)
    private String nombre;
    
    @Column(length = 100, nullable = false)
    private String marca;
    
	@Column(length = 100, nullable = false)
    private String categoria;
    
    @Column(length = 50, nullable = false)
    private String capacidad;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;


    
    //--- COLUMNAS NUMÉRICAS ---
    
    @Column(name = "precio_compra", precision = 10, scale = 2, nullable = false)
    private java.math.BigDecimal precio_compra;
    
    @Column(name = "precio_venta", precision = 10, scale = 2, nullable = false)
    private java.math.BigDecimal precio_venta;

    // GETTERS Y SETTERS
    
    public Integer getId_producto() {
		return id_producto;
	}

	public void setId_producto(Integer id_producto) {
		this.id_producto = id_producto;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getMarca() {
		return marca;
	}

	public void setMarca(String marca) {
		this.marca = marca;
	}

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public String getCapacidad() {
		return capacidad;
	}

	public void setCapacidad(String capacidad) {
		this.capacidad = capacidad;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public java.math.BigDecimal getPrecio_compra() {
		return precio_compra;
	}

	public void setPrecio_compra(java.math.BigDecimal precio_compra) {
		this.precio_compra = precio_compra;
	}

	public java.math.BigDecimal getPrecio_venta() {
		return precio_venta;
	}

	public void setPrecio_venta(java.math.BigDecimal precio_venta) {
		this.precio_venta = precio_venta;
	}
}