package com.mx.ubam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.mx.ubam.dto.CheckoutRequest;
import com.mx.ubam.model.Producto;
import com.mx.ubam.repository.ItemVentaRepository;
import com.mx.ubam.repository.LoteRepository;
import com.mx.ubam.repository.ProductoRepository;
import java.util.List;
@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repo;
    @Autowired
    private ItemVentaRepository repoItem;

    // 🔹 CREAR
    public Producto guardar(Producto producto) {
        return repo.save(producto);
    }

    // 🔹 EDITAR
    public Producto editar(Integer id, Producto producto) {

        Producto existente = repo.findById(id).orElse(null);

        if (existente != null) {
            existente.setNombre(producto.getNombre());
            existente.setMarca(producto.getMarca());
            existente.setCategoria(producto.getCategoria());
            existente.setCapacidad(producto.getCapacidad());
            existente.setDescripcion(producto.getDescripcion());
            existente.setPrecio_compra(producto.getPrecio_compra());
            existente.setPrecio_venta(producto.getPrecio_venta());

            return repo.save(existente);
        }

        return null;
    }
    
    
    
 // 🔹 BUSCAR UN SOLO PRODUCTO POR ID (Para el modal)
    public Producto buscarPorId(Integer id) {
        return repo.findById(id).orElse(null);
    }
    
    public Producto eliminar(Integer id) {
    	
    	//Buscar el producto en bd
        Producto producto = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        
        repo.delete(producto);
        
        return producto;
    }
    
    public List<Producto> listar() {
        return repo.findAll();
    }
    
    
    //servicios de Lote
    
    public List<CheckoutRequest> obtenerMasVendidos() {
        // Pedimos los 10 mejores
    	/* page Request sirve para saber cuantos datos se jala */
        List<Object[]> resultados = repoItem.findTopSelling(PageRequest.of(0, 10));
        
        return resultados.stream()
                .map(res -> new CheckoutRequest(((Producto)res[0]).getNombre(), (Long)res[1]))
                .toList();
    }

    public List<CheckoutRequest> obtenerMenosVendidos() {
        List<Object[]> resultados = repoItem.findLowSelling(PageRequest.of(0, 10));
        
        return resultados.stream()
                .map(res -> new CheckoutRequest(((Producto)res[0]).getNombre(), (Long)res[1]))
                .toList();
    }
    
}