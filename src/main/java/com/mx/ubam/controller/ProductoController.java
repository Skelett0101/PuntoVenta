package com.mx.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mx.ubam.dto.CheckoutRequest;
import com.mx.ubam.model.Lote;
import com.mx.ubam.model.Producto;
import com.mx.ubam.service.LoteService;
import com.mx.ubam.service.ProductoService;

import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("/api/productos")
@CrossOrigin
public class ProductoController {

    @Autowired
    private ProductoService service;

    @Autowired
    private LoteService loteService;
    
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
    
 // 🔹 BUSCAR POR CATEGORÍA
    @GetMapping("/categoria/{nombre}")
    public List<Producto> listarPorCategoria(@PathVariable String nombre) {
        return service.listarPorCategoria(nombre);
    }
    
    @GetMapping("/categorias-unicas")
    public List<String> obtenerCategorias() {
        return service.listarCategoriasUnicas();
    }
    
    @GetMapping("/lotes/filtrar")
    public ResponseEntity<List<Lote>> filtrarLotesPorFecha(
            @RequestParam("fecha") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        try {
            List<Lote> lotes = loteService.filtrarLotesPorCaducidad(fecha); 
            return new ResponseEntity<>(lotes, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}