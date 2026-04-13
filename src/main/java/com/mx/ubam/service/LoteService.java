package com.mx.ubam.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mx.ubam.model.Lote;
import com.mx.ubam.repository.LoteRepository;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepo; 

    //Filtrar lotes
    public List<Lote> filtrarLotesPorCaducidad(LocalDate fecha) {
        return loteRepo.findByFechaCaducidad(fecha);
    }
}