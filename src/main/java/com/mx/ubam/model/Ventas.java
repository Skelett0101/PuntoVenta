package com.mx.ubam.model;

import java.math.BigDecimal;
import java.time.*;

import com.fasterxml.jackson.annotation.*;

import jakarta.persistence.*;

@Entity
@Table(name = "venta")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ventas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long idVenta;

    @Column(name = "nombre_venta", length = 100)
    private String nombreVenta;

    // --- LLAVE FORÁNEA
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @Column(name = "hora_venta", nullable = false)
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaVenta;

    // --- MONTOS CON BIGDECIMAL ---
    @Column(name = "iva", precision = 10, scale = 2)
    private BigDecimal iva;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    // Constructor
    public Ventas() {
    }
    
  //GETTERS AND SETTERS

	public Long getIdVenta() {
		return idVenta;
	}

	public void setIdVenta(Long idVenta) {
		this.idVenta = idVenta;
	}

	public String getNombreVenta() {
		return nombreVenta;
	}

	public void setNombreVenta(String nombreVenta) {
		this.nombreVenta = nombreVenta;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public LocalTime getHoraVenta() {
		return horaVenta;
	}

	public void setHoraVenta(LocalTime horaVenta) {
		this.horaVenta = horaVenta;
	}

	public BigDecimal getIva() {
		return iva;
	}

	public void setIva(BigDecimal iva) {
		this.iva = iva;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}
    
    
    
    
}