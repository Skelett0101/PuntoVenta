package com.mx.ubam.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mx.ubam.model.ItemVenta;
import com.mx.ubam.repository.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.mx.ubam.dto.VentaRequest;
import com.mx.ubam.model.*;
@Service
public class VentaService {

    @PersistenceContext
    private EntityManager entityManager; // JPA puro

    @Autowired private VentaRepository ventaRepo;
    @Autowired private LoteRepository loteRepo;
    @Autowired private ItemVentaRepository itemRepo;

    @Transactional
    public Ventas procesarVenta(VentaRequest dto) {
        Ventas venta = new Ventas();
        
        // Obtenemos una referencia al usuario sin usar Repository
        Usuario usuario = entityManager.getReference(Usuario.class, dto.getIdUsuario());
        venta.setUsuario(usuario);
        
        venta.setNombreVenta(dto.getNombreVenta());
        venta.setFecha(LocalDate.now());
        venta.setHoraVenta(LocalTime.now());

        BigDecimal subtotalAcumulado = BigDecimal.ZERO;

     // Dentro del bucle for de procesarVenta en VentaService.java
        for (VentaRequest.ItemDetalleDTO itemDto : dto.getItems()) {
            
            // 🔥 CAMBIO AQUÍ: Usamos el nuevo método del repositorio
            List<Lote> lotes = loteRepo.buscarLotesDisponiblesPEPS(itemDto.getIdProducto());

            if (lotes.isEmpty()) {
                throw new RuntimeException("Sin existencias para el producto ID: " + itemDto.getIdProducto());
            }
            
            // El resto del código sigue igual...
            Lote lote = lotes.get(0);
            
            // Hibernate gestiona el estado "Dirty" y hará el Update al terminar
            lote.setStockLote(lote.getStockLote() - itemDto.getCantidad());

            ItemVenta detalle = new ItemVenta();
            detalle.setVenta(venta);
            detalle.setProducto(lote.getProducto());
            detalle.setLote(lote);
            detalle.setCantidadVendida(itemDto.getCantidad());
            
            // Cálculo de precios
            BigDecimal precio = lote.getProducto().getPrecio_venta();
            subtotalAcumulado = subtotalAcumulado.add(precio.multiply(new BigDecimal(itemDto.getCantidad())));
            
            itemRepo.save(detalle);
        }

        venta.setSubtotal(subtotalAcumulado);
        venta.setIva(subtotalAcumulado.multiply(new BigDecimal("0.16")));
        venta.setTotal(subtotalAcumulado.add(venta.getIva()));

        return ventaRepo.save(venta);
    }
}