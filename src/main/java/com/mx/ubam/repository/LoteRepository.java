package com.mx.ubam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mx.ubam.model.Lote;
import com.mx.ubam.model.Producto;


@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    // Decisiones: Productos que se están acabando (Stock Bajo)
    List<Lote> findByStockLoteLessThanOrderByStockLoteAsc(Long threshold);

    // Decisiones: Productos próximos a caducar (en los próximos 30 días)
    List<Lote> findByFechaCaducidadBefore(java.time.LocalDate fecha);
}
