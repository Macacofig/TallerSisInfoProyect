package com.unihub.backend.service;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.ClassHelpers.Horario.SolucionHorario;
import com.unihub.backend.dto.horario.HorarioFiltroRequest;
import com.unihub.backend.dto.horario.HorarioRequest;
import com.unihub.backend.dto.horario.HorarioResponse;
import com.unihub.backend.mapper.horario.HorarioMapper;
import com.unihub.backend.mapper.horario.MapeoGeneracion;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class HorarioService {

    private final HorarioMapper horarioMapper;
    private final HorarioGeneradorService horarioGeneradorService;

    public HorarioService() {
        this(new HorarioMapper(), new HorarioGeneradorService());
    }

    public HorarioService(HorarioMapper horarioMapper, HorarioGeneradorService horarioGeneradorService) {
        this.horarioMapper = horarioMapper;
        this.horarioGeneradorService = horarioGeneradorService;
    }

    public HorarioResponse generar(HorarioRequest request) {
        if (request == null || request.materias() == null || request.materias().isEmpty()) {
            return new HorarioResponse(List.of());
        }

        HorarioFiltroRequest filtros = request.filtros() == null
                ? new HorarioFiltroRequest(null, null, null, null, null, false)
                : request.filtros();

        MapeoGeneracion mapeo = horarioMapper.crearMapeo(request.materias());
        List<HorarioTrabajo> trabajos = horarioMapper.toHorarioTrabajo(request.materias(), mapeo);
        Map<Long, List<Oferta>> ofertasPorMateria = horarioMapper.agruparPorMateria(trabajos);

        List<SolucionHorario> soluciones = horarioGeneradorService.generar(ofertasPorMateria, filtros, mapeo);
        return horarioMapper.toResponse(soluciones, mapeo);
    }
}
