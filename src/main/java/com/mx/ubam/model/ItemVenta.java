package com.mx.ubam.model;

import jakarta.persistence.*;

@Entity
@Table(name = "item_venta")
public class ItemVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item_venta")
    private Long idItemVenta;

    // --- RELACIÓN CON LA VENTA (Llave Foránea) ---
    @ManyToOne
    @JoinColumn(name = "id_venta", nullable = false)
    private Ventas venta;

    // --- RELACIÓN CON EL PRODUCTO (Llave Foránea) ---
    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    // --- RELACIÓN CON EL LOTE (Llave Foránea) ---
    @ManyToOne
    @JoinColumn(name = "id_lote", nullable = false)
    private Lote lote;

    @Column(name = "cantidad_vendida", nullable = false)
    private Integer cantidadVendida;

    // Constructor vacio
    public ItemVenta() {
    	
    }

	public Long getIdItemVenta() {
		return idItemVenta;
	}

	public void setIdItemVenta(Long idItemVenta) {
		this.idItemVenta = idItemVenta;
	}

	public Ventas getVenta() {
		return venta;
	}

	public void setVenta(Ventas venta) {
		this.venta = venta;
	}

	public Producto getProducto() {
		return producto;
	}

	public void setProducto(Producto producto) {
		this.producto = producto;
	}

	public Lote getLote() {
		return lote;
	}

	public void setLote(Lote lote) {
		this.lote = lote;
	}

	public Integer getCantidadVendida() {
		return cantidadVendida;
	}

	public void setCantidadVendida(Integer cantidadVendida) {
		this.cantidadVendida = cantidadVendida;
	}
    
    
    
}