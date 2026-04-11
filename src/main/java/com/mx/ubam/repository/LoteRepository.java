package com.mx.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mx.ubam.model.Lote;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    // Usamos JPQL para ignorar los problemas de nombres automáticos de Spring
    @Query("SELECT l FROM Lote l WHERE l.producto.id_producto = :id AND l.stockLote > 0 ORDER BY l.fechaIngreso ASC")
    List<Lote> buscarLotesDisponiblesPEPS(@Param("id") Integer id);

    List<Lote> findByStockLoteLessThanOrderByStockLoteAsc(Long threshold);
    List<Lote> findByFechaCaducidadBefore(java.time.LocalDate fecha);
}