package com.mx.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.model.Producto;
import com.mx.ubam.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin
public class ProductoController {

    @Autowired
    private ProductoService service;

    // 🔹 CREAR PRODUCTO
    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return service.guardar(producto);
    }

    // 🔹 EDITAR PRODUCTO
    @PutMapping("/{id}")
    public Producto editarProducto(@PathVariable Integer id, @RequestBody Producto producto) {
        return service.editar(id, producto);
    }
}