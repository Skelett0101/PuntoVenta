package com.mx.ubam.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Esta es la línea que faltaba
import org.springframework.stereotype.Repository;

import com.mx.ubam.model.Ventas;

@Repository
public interface VentaRepository extends JpaRepository<Ventas, Long> {

    // Buscar ventas por una fecha específica (Útil para el corte de caja)
    List<Ventas> findByFecha(LocalDate fecha);

    // Buscar ventas de un usuario/empleado específico
    List<Ventas> findByUsuarioIdUsuario(Long idUsuario);
    
    // Buscar las ventas más recientes
    List<Ventas> findTop10ByOrderByIdVentaDesc();
    
    // Lógica 1: Cuenta cuántos tickets (id_venta) hay por día
    @Query("SELECT v.fecha, COUNT(v) FROM Ventas v GROUP BY v.fecha ORDER BY v.fecha ASC")
    List<Object[]> contarVentasPorDia();

    // Lógica 2: Suma la columna 'total' de todas las ventas por día
    @Query("SELECT v.fecha, SUM(v.total) FROM Ventas v GROUP BY v.fecha ORDER BY v.fecha ASC")
    List<Object[]> sumarIngresosPorDia();
}