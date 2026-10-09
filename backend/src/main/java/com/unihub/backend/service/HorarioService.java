package com.unihub.backend.service;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.ClassHelpers.Horario.SolucionHorario;
import com.unihub.backend.dto.horario.HorarioFiltroRequest;
import com.unihub.backend.dto.horario.HorarioGeneracionRequest;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioNormalizacionResponse;
import com.unihub.backend.dto.horario.HorarioResponse1;
import com.unihub.backend.dto.horario.HorarioResponse2;
import com.unihub.backend.mapper.horario.HorarioMapper;
import com.unihub.backend.mapper.horario.MapeoGeneracion;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class HorarioService {

    private record SesionHorario(Map<Long, List<Oferta>> ofertasPorMateria, MapeoGeneracion mapeo) {
    }

    private final Map<String, SesionHorario> sesiones = new ConcurrentHashMap<>();
    private final HorarioMapper horarioMapper;
    private final HorarioGeneradorService horarioGeneradorService;

    public HorarioService() {
        this(new HorarioMapper(), new HorarioGeneradorService());
    }

    public HorarioService(HorarioMapper horarioMapper, HorarioGeneradorService horarioGeneradorService) {
        this.horarioMapper = horarioMapper;
        this.horarioGeneradorService = horarioGeneradorService;
    }

    public HorarioNormalizacionResponse normalizarEntradaCruda(List<HorarioMateriaRequest> materiasCrudas) {
        List<HorarioMateriaRequest> materias = materiasCrudas == null ? List.of() : List.copyOf(materiasCrudas);
        MapeoGeneracion mapeo = horarioMapper.crearMapeo(materias);
        List<HorarioResponse1> salida = horarioMapper.toResponse1(materias, mapeo);
        List<HorarioTrabajo> trabajos = horarioMapper.toHorarioTrabajo(materias, mapeo);
        Map<Long, List<Oferta>> ofertasPorMateria = horarioMapper.agruparPorMateria(trabajos);
        String sessionId = UUID.randomUUID().toString();
        sesiones.put(sessionId, new SesionHorario(ofertasPorMateria, mapeo));
        return new HorarioNormalizacionResponse(sessionId, salida);
    }

    public List<HorarioResponse2> generarDesdeSession(HorarioGeneracionRequest request) {
        if (request == null || request.sessionId() == null || request.sessionId().isBlank()) {
            return List.of();
        }

        SesionHorario sesion = sesiones.remove(request.sessionId());
        if (sesion == null) {
            return List.of();
        }

        HorarioFiltroRequest filtros = request.filtros() == null
                ? new HorarioFiltroRequest(null, null, null, null, null, false)
                : request.filtros();
        List<SolucionHorario> soluciones = horarioGeneradorService.generar(sesion.ofertasPorMateria(), filtros, sesion.mapeo());
        return horarioMapper.toResponse2(soluciones, sesion.mapeo());
    }
}
