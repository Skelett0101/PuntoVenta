package com.mx.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mx.ubam.model.Lote;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

	@Query("SELECT l FROM Lote l WHERE l.producto.id_producto = :id_producto AND l.stockLote > 0 ORDER BY l.fechaIngreso ASC")
    List<Lote> buscarLotesDisponiblesPEPS(@Param("id_producto") Integer id_producto);

    List<Lote> findByStockLoteLessThanOrderByStockLoteAsc(Long threshold);
    
    // Buscar lotes por fecha de caducidad
    List<Lote> findByFechaCaducidad(java.time.LocalDate fechaCaducidad);
}