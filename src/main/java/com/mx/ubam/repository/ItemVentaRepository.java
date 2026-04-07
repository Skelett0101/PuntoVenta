package com.mx.ubam.repository;
import org.springframework.data.domain.Pageable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.mx.ubam.model.ItemVenta;

public interface ItemVentaRepository extends JpaRepository<ItemVenta, Integer> {

    // Consulta para obtener los productos y la suma de sus cantidades vendidas
    @Query("SELECT ItVenta.producto, SUM(ItVenta.cantidadVendida) as totalVenta " +
           "FROM ItemVenta ItVenta " +
           "GROUP BY ItVenta.producto " +
           "ORDER BY totalVenta DESC")
    List<Object[]> findTopSelling(Pageable pageable);

    // Consulta para los menos vendidos (Orden Ascendente)
    @Query("SELECT ItVenta.producto, SUM(ItVenta.cantidadVendida) as totalVenta " +
           "FROM ItemVenta ItVenta " +
           "GROUP BY ItVenta.producto " +
           "ORDER BY totalVenta ASC")
    List<Object[]> findLowSelling(Pageable pageable);
}