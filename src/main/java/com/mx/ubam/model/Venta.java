package com.mx.ubam.model;

import jakarta.persistence.*;


@Entity
@Table(name = "venta")
public class Venta {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id_Venta;

	public Long getId_Venta() {
		return id_Venta;
	}

	public void setId_Venta(Long id_Venta) {
		this.id_Venta = id_Venta;
	}
	

}
