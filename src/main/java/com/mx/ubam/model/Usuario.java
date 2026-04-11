package com.mx.ubam.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario; // Esto creará un BIGINT en MySQL

    @Column(name = "nombre_usuario", length = 100, nullable = false)
    private String nombreUsuario;

    @Column(name = "correo_usuario", length = 150, unique = true, nullable = false)
    private String correoUsuario;

    @Column(name = "contrasena_usuario", nullable = false)
    private String contrasenaUsuario;

    @Column(name = "rol", length = 20)
    private String rol; // Puedes usar String por ahora para manejar 'Admin' o 'Vendedor'

    public Usuario() {}

    
    
 // Getters y Setters
	public Long getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(Long idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getNombreUsuario() {
		return nombreUsuario;
	}

	public void setNombreUsuario(String nombreUsuario) {
		this.nombreUsuario = nombreUsuario;
	}

	public String getCorreoUsuario() {
		return correoUsuario;
	}

	public void setCorreoUsuario(String correoUsuario) {
		this.correoUsuario = correoUsuario;
	}

	public String getContrasenaUsuario() {
		return contrasenaUsuario;
	}

	public void setContrasenaUsuario(String contrasenaUsuario) {
		this.contrasenaUsuario = contrasenaUsuario;
	}

	public String getRol() {
		return rol;
	}

	public void setRol(String rol) {
		this.rol = rol;
	}
    
    
    
    
    
}