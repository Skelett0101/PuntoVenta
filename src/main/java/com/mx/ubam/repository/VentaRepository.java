package com.mx.ubam.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
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
}