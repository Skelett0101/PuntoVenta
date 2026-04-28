package com.mx.ubam.controller;

import com.mx.ubam.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // --- ENDPOINT DE INICIO DE SESIÓN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario credenciales) {
        try {
            // Buscamos si existe un usuario con ese nombre Y esa contraseña
            String sql = "SELECT id_usuario, nombre_usuario, correo_usuario, rol " +
                         "FROM usuario " +
                         "WHERE nombre_usuario = ? AND contrasena_usuario = ?";
                         
            List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(
                    sql, 
                    credenciales.getNombreUsuario(), 
                    credenciales.getContrasenaUsuario()
            );

            // Si la lista está vacía, el usuario o contraseña están mal
            if (usuarios.isEmpty()) {
                return new ResponseEntity<>("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
            }

            // Si es correcto, devolvemos los datos del usuario (Omitiendo la contraseña por seguridad)
            return new ResponseEntity<>(usuarios.get(0), HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error en el servidor de autenticación", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}