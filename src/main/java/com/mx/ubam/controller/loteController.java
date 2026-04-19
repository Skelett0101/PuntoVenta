package com.mx.ubam.controller;

import com.mx.ubam.model.Lote;
import com.mx.ubam.model.Producto;
import com.mx.ubam.repository.LoteRepository;
import com.mx.ubam.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*") 
public class loteController {

    @Autowired
    private LoteRepository loteRepo;

    @Autowired
    private ProductoRepository productoRepo;

    
    @GetMapping
    public List<Lote> listarTodo() {
        return loteRepo.findAll();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarLote(@PathVariable Long id) {
        try {
            // 1. Primero destruimos cualquier venta que esté usando este lote
            loteRepo.forzarBorradoDeVentas(id);
            
            // 2. Ahora sí, borramos el lote sin que la base de datos se queje
            loteRepo.deleteById(id);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al forzar eliminación: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> payload) {
        try {
            Lote nuevoLote = new Lote();
            nuevoLote.setCodigoLote(payload.get("codigo_lote").toString());
            nuevoLote.setStockLote(Long.parseLong(payload.get("stock_lote").toString()));
            nuevoLote.setFechaIngreso(java.time.LocalDate.parse(payload.get("fecha_ingreso").toString()));
            nuevoLote.setFechaCaducidad(java.time.LocalDate.parse(payload.get("fecha_caducidad").toString()));

            Integer idProd = (Integer) payload.get("id_producto");
            Producto pro = productoRepo.findById(idProd)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            nuevoLote.setProducto(pro);

            return ResponseEntity.ok(loteRepo.save(nuevoLote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}