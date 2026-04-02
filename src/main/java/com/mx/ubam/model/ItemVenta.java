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
    private Venta venta;

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
}