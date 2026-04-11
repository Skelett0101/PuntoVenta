package com.mx.ubam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mx.ubam.model.Producto;

@Repository
//En ProductoRepository.java
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
 
 // Hibernate buscará automáticamente en la columna 'categoria'
 List<Producto> findByCategoria(String categoria);
}