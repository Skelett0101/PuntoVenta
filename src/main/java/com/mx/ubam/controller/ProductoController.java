package com.mx.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.dto.CheckoutRequest;
import com.mx.ubam.model.Producto;
import com.mx.ubam.service.ProductoService;
import java.util.List;
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
    
    //Eliminar Producto
    @DeleteMapping("/{id}")
    public Producto eliminarProducto(@PathVariable Integer id) {
    	return service.eliminar(id);
    	
    }
    
    //List Producto
    @GetMapping
    public List<Producto> listarProductos() {
        return service.listar();
    }
    
 // 🔹 OBTENER UN PRODUCTO POR ID
    @GetMapping("/{id}")
    public Producto obtenerProductoPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    //productos mas
    @GetMapping("/mas/top")
    public List<CheckoutRequest> getTopSelling() {
        return service.obtenerMasVendidos();
    }

    //productos menos top en la tienda
    @GetMapping("/menos/low")
    public List<CheckoutRequest> getLowSelling() {
        return service.obtenerMenosVendidos();
    }
    
}