package com.unihub.backend.service;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.ClassHelpers.Horario.SolucionHorario;
import com.unihub.backend.dto.horario.HorarioBloqueFiltroRequest;
import com.unihub.backend.dto.horario.HorarioFiltroRequest;
import com.unihub.backend.mapper.horario.MapeoGeneracion;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
public class HorarioGeneradorService {

    public boolean hayConflicto(HorarioTrabajo a, HorarioTrabajo b) {
        if (a == null || b == null) {
            return false;
        }

        if (a.dia() != b.dia()) {
            return false;
        }

        return a.horaInicio().isBefore(b.horaFin())
                && a.horaFin().isAfter(b.horaInicio());
    }

    public List<SolucionHorario> generar(
            Map<Long, List<Oferta>> ofertasPorMateria,
            HorarioFiltroRequest filtros,
            MapeoGeneracion mapeo
    ) {
        HorarioFiltroRequest filtroFinal = filtros == null ? new HorarioFiltroRequest(null, null, null, null, null, false) : filtros;

        Set<Long> materiasExcluidas = new HashSet<>(filtroFinal.materiasExcluidas());
        Map<Long, List<Oferta>> ofertasDisponibles = new HashMap<>();
        for (Map.Entry<Long, List<Oferta>> entry : ofertasPorMateria.entrySet()) {
            if (materiasExcluidas.contains(entry.getKey())) {
                continue;
            }

            List<Oferta> validas = entry.getValue().stream()
                    .filter(oferta -> cumpleRestriccionDocente(oferta, filtroFinal.docentes()))
                    .toList();

            if (!validas.isEmpty()) {
                ofertasDisponibles.put(entry.getKey(), validas);
            }
        }

        List<Long> materias = new ArrayList<>(ofertasDisponibles.keySet());
        Set<Long> obligatorias = new HashSet<>(filtroFinal.materiasObligatorias());
        materias.sort(Comparator
                .comparingInt((Long materiaId) -> obligatorias.contains(materiaId) ? 0 : 1)
                .thenComparingInt(materiaId -> ofertasDisponibles.getOrDefault(materiaId, List.of()).size()));

        List<SolucionHorario> soluciones = new ArrayList<>();
        backtracking(
                materias,
                ofertasDisponibles,
                new ArrayList<>(),
                new HashSet<>(),
                obligatorias,
                filtroFinal,
                soluciones
        );

        return soluciones.stream()
                .sorted((a, b) -> {
                    int porPuntuacion = Integer.compare(b.puntuacion(), a.puntuacion());
                    if (porPuntuacion != 0) {
                        return porPuntuacion;
                    }
                    return Integer.compare(b.cantidadMaterias(), a.cantidadMaterias());
                })
                .limit(20)
                .toList();
    }

    private void backtracking(
            List<Long> materias,
            Map<Long, List<Oferta>> ofertasPorMateria,
            List<HorarioTrabajo> seleccionados,
            Set<Long> materiasSeleccionadas,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros,
            List<SolucionHorario> soluciones
    ) {
        if (materias.isEmpty()) {
            registrarSolucion(seleccionados, obligatorias, filtros, soluciones);
            return;
        }

        Long materiaId = materias.getFirst();
        List<Long> siguientes = new ArrayList<>(materias.subList(1, materias.size()));

        if (!obligatorias.contains(materiaId)) {
            backtracking(
                    siguientes,
                    ofertasPorMateria,
                    new ArrayList<>(seleccionados),
                    new HashSet<>(materiasSeleccionadas),
                    obligatorias,
                    filtros,
                    soluciones
            );
        }

        List<Oferta> ofertas = ofertasPorMateria.getOrDefault(materiaId, List.of());
        for (Oferta oferta : ofertas) {
            if (materiasSeleccionadas.contains(materiaId)) {
                continue;
            }
            if (!cumpleRestriccionDocente(oferta, filtros.docentes())) {
                continue;
            }
            if (hayConflictoConSeleccionados(oferta.horarios(), seleccionados)) {
                continue;
            }

            List<HorarioTrabajo> nuevosSeleccionados = new ArrayList<>(seleccionados);
            nuevosSeleccionados.addAll(oferta.horarios());

            Set<Long> nuevasMaterias = new HashSet<>(materiasSeleccionadas);
            nuevasMaterias.add(materiaId);

            backtracking(
                    siguientes,
                    ofertasPorMateria,
                    nuevosSeleccionados,
                    nuevasMaterias,
                    obligatorias,
                    filtros,
                    soluciones
            );
        }
    }

    private void registrarSolucion(
            List<HorarioTrabajo> horarios,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros,
            List<SolucionHorario> soluciones
    ) {
        if (horarios == null || horarios.isEmpty()) {
            return;
        }

        Set<Long> materiasEnSolucion = horarios.stream()
                .map(HorarioTrabajo::materiaId)
                .collect(java.util.stream.Collectors.toSet());

        int min = filtros.cantidadMaterias().min() == null ? 1 : filtros.cantidadMaterias().min();
        int max = filtros.cantidadMaterias().max() == null ? 6 : filtros.cantidadMaterias().max();

        if (materiasEnSolucion.size() < min || materiasEnSolucion.size() > max) {
            return;
        }

        if (!obligatorias.isEmpty() && !obligatorias.stream().allMatch(materiasEnSolucion::contains)) {
            return;
        }

        int puntuacion = calcularPuntuacion(horarios, obligatorias, filtros);
        soluciones.add(new SolucionHorario(materiasEnSolucion.size(), puntuacion, horarios));
    }

    private int calcularPuntuacion(
            List<HorarioTrabajo> horarios,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros
    ) {
        Map<String, List<HorarioTrabajo>> ofertasAgrupadas = new HashMap<>();
        for (HorarioTrabajo horario : horarios) {
            String clave = horario.materiaId() + ":" + horario.docenteId() + ":" + horario.paralelo();
            ofertasAgrupadas.computeIfAbsent(clave, ignored -> new ArrayList<>()).add(horario);
        }

        int puntuacionTotal = 0;
        for (List<HorarioTrabajo> ofertaHorarios : ofertasAgrupadas.values()) {
            int score = 1;
            Long materiaId = ofertaHorarios.getFirst().materiaId();
            Long docenteId = ofertaHorarios.getFirst().docenteId();

            if (obligatorias.contains(materiaId)) {
                score += 10;
            }

            if (docenteEsObligatorioParaMateria(filtros.docentes(), materiaId, docenteId)) {
                score += 10;
            }

            if (ofertaEvitaHorariosNoDisponibles(ofertaHorarios, filtros.horariosNoDisponibles())) {
                score += 5;
            }

            if (Boolean.TRUE.equals(filtros.evitarHuecos()) && !tieneHueco(ofertaHorarios)) {
                score += 5;
            }

            puntuacionTotal += score;
        }

        return puntuacionTotal;
    }

    private boolean docenteEsObligatorioParaMateria(
            Map<Long, List<Long>> docentes,
            Long materiaId,
            Long docenteId
    ) {
        if (docentes == null || docentes.isEmpty()) {
            return false;
        }

        for (Map.Entry<Long, List<Long>> entry : docentes.entrySet()) {
            Long docenteMapeado = entry.getKey();
            List<Long> materias = entry.getValue();
            if (docenteMapeado.equals(docenteId) && materias.contains(materiaId)) {
                return true;
            }
        }

        return false;
    }

    private boolean ofertaEvitaHorariosNoDisponibles(
            List<HorarioTrabajo> horarios,
            List<HorarioBloqueFiltroRequest> horariosNoDisponibles
    ) {
        if (horariosNoDisponibles == null || horariosNoDisponibles.isEmpty()) {
            return true;
        }

        for (HorarioTrabajo horario : horarios) {
            for (HorarioBloqueFiltroRequest noDisponible : horariosNoDisponibles) {
                if (horario.dia() == noDisponible.dia()
                        && horario.horaInicio().isBefore(LocalTime.parse(noDisponible.horaFin()))
                        && horario.horaFin().isAfter(LocalTime.parse(noDisponible.horaInicio()))) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean tieneHueco(List<HorarioTrabajo> horarios) {
        if (horarios == null || horarios.size() < 2) {
            return false;
        }

        Map<Integer, List<HorarioTrabajo>> porDia = new HashMap<>();
        for (HorarioTrabajo horario : horarios) {
            porDia.computeIfAbsent(horario.dia(), ignored -> new ArrayList<>()).add(horario);
        }

        for (List<HorarioTrabajo> diaHorarios : porDia.values()) {
            diaHorarios.sort(Comparator.comparing(HorarioTrabajo::horaInicio));
            for (int i = 1; i < diaHorarios.size(); i++) {
                HorarioTrabajo anterior = diaHorarios.get(i - 1);
                HorarioTrabajo actual = diaHorarios.get(i);
                if (anterior.horaFin().isBefore(actual.horaInicio())) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean hayConflictoConSeleccionados(List<HorarioTrabajo> ofertaHorarios, List<HorarioTrabajo> seleccionados) {
        for (HorarioTrabajo horarioOferta : ofertaHorarios) {
            for (HorarioTrabajo horarioSeleccionado : seleccionados) {
                if (hayConflicto(horarioOferta, horarioSeleccionado)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean cumpleRestriccionDocente(Oferta oferta, Map<Long, List<Long>> docentes) {
        if (docentes == null || docentes.isEmpty()) {
            return true;
        }

        boolean hayRestriccionParaMateria = false;
        for (Map.Entry<Long, List<Long>> entry : docentes.entrySet()) {
            Long docenteId = entry.getKey();
            List<Long> materiasPermitidas = entry.getValue();
            if (materiasPermitidas.contains(oferta.materiaId())) {
                hayRestriccionParaMateria = true;
                if (!docenteId.equals(oferta.docenteId())) {
                    return false;
                }
            }
        }

        return true;
    }
}
