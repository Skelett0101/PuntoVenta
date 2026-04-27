package com.mx.ubam.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.mx.ubam.model.Lote;
import com.mx.ubam.model.Producto;
import com.mx.ubam.repository.LoteRepository;
import com.mx.ubam.repository.ProductoRepository;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepo; 
    @Autowired
    private ProductoRepository productoRepo;

    //Filtrar lotes
    public List<Lote> filtrarLotesPorCaducidad(LocalDate fecha) {
        return loteRepo.findByFechaCaducidad(fecha);
    }
    
}