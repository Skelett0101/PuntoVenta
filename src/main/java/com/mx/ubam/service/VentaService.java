package com.mx.ubam.service;
import com.mx.ubam.repository.VentaRepository;
import com.mx.ubam.repository.LoteRepository;
import com.mx.ubam.repository.ItemVentaRepository;
import com.mx.ubam.repository.VentaRepository;
import com.mx.ubam.repository.LoteRepository;
import com.mx.ubam.repository.ItemVentaRepository;
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
    private EntityManager entityManager;

    @Autowired private VentaRepository ventaRepo;
    @Autowired private LoteRepository loteRepo;
    @Autowired private ItemVentaRepository itemRepo;

    @Transactional
    public Ventas procesarVenta(VentaRequest dto) {
        // 1. Instanciamos la Venta base
        Ventas venta = new Ventas();
        Usuario usuario = entityManager.getReference(Usuario.class, dto.getIdUsuario());
        venta.setUsuario(usuario);
        venta.setNombreVenta(dto.getNombreVenta() != null ? dto.getNombreVenta() : "Venta General");
        venta.setFecha(LocalDate.now());
        venta.setHoraVenta(LocalTime.now());

        // 2. Registramos la venta para obtener el ID (Evita TransientPropertyValueException)
        Ventas ventaGuardada = ventaRepo.save(venta); 

        BigDecimal subtotalAcumulado = BigDecimal.ZERO;

        // --- UN SOLO BUCLE PARA TODO ---
        for (VentaRequest.ItemDetalleDTO itemDto : dto.getItems()) {
            Integer idPro = itemDto.getIdProducto();
            System.out.println(">>> Procesando Producto ID: " + idPro);

            // Buscar lotes con stock usando PEPS
            List<Lote> lotes = loteRepo.buscarLotesDisponiblesPEPS(idPro);
            System.out.println(">>> Lotes encontrados: " + lotes.size());

            if (lotes.isEmpty()) {
                throw new RuntimeException("Sin stock para el ID: " + idPro);
            }

            Lote lote = lotes.get(0);

            // Validar que el lote tenga lo suficiente
            if (lote.getStockLote() < itemDto.getCantidad()) {
                throw new RuntimeException("Stock insuficiente en lote " + lote.getCodigoLote());
            }

            // Descontar stock y guardar lote actualizado
            lote.setStockLote(lote.getStockLote() - itemDto.getCantidad());
            loteRepo.save(lote);

            // 3. Crear el detalle de la venta
            ItemVenta detalle = new ItemVenta();
            detalle.setVenta(ventaGuardada);
            detalle.setProducto(lote.getProducto());
            detalle.setLote(lote);
            detalle.setCantidadVendida(itemDto.getCantidad());
            
            // Calcular montos
            BigDecimal precio = lote.getProducto().getPrecio_venta();
            subtotalAcumulado = subtotalAcumulado.add(precio.multiply(new BigDecimal(itemDto.getCantidad())));
            
            itemRepo.save(detalle);
        }

        // 4. Actualizar totales finales
        ventaGuardada.setSubtotal(subtotalAcumulado);
        ventaGuardada.setIva(subtotalAcumulado.multiply(new BigDecimal("0.16")));
        ventaGuardada.setTotal(subtotalAcumulado.add(ventaGuardada.getIva()));
        
        return ventaRepo.save(ventaGuardada);
    }
    
    
    //filtrar por fecha
    public List<Ventas> listarPorFecha(LocalDate fecha) {
        return ventaRepo.findByFecha(fecha);
    }
 // Dentro de VentaService.java
 // ... (Mantén tu código anterior de procesarVenta y listarPorFecha) ...

    // --- MÉTODOS PARA LAS GRÁFICAS CORREGIDOS ---
    
    public List<Object[]> obtenerFrecuenciaVentas() {
        // ERROR ANTERIOR: Usabas 'ventaRepository', pero tu variable se llama 'ventaRepo'
        return ventaRepo.contarVentasPorDia();
    }

    public List<Object[]> obtenerIngresosDiarios() {
        // ERROR ANTERIOR: Usabas 'ventaRepository', pero tu variable se llama 'ventaRepo'
        return ventaRepo.sumarIngresosPorDia();
    }
}