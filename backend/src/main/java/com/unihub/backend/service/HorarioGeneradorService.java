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
import java.util.PriorityQueue;
import java.util.Set;
import java.util.stream.Collectors;

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

    public boolean tieneConflictoInterno(Oferta oferta) {
        if (oferta == null || oferta.horarios() == null || oferta.horarios().isEmpty()) {
            return false;
        }

        for (int i = 0; i < oferta.horarios().size(); i++) {
            for (int j = i + 1; j < oferta.horarios().size(); j++) {
                if (hayConflicto(oferta.horarios().get(i), oferta.horarios().get(j))) {
                    return true;
                }
            }
        }

        return false;
    }

    private static final int LIMITE_OPCIONES = 12;

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
                    .filter(oferta -> cumpleDisponibilidad(oferta, filtroFinal.horariosNoDisponibles()))
                    .toList();

            if (!validas.isEmpty()) {
                ofertasDisponibles.put(entry.getKey(), validas);
            }
        }

        int min = filtroFinal.cantidadMaterias().min() == null ? 1 : filtroFinal.cantidadMaterias().min();
        if (ofertasDisponibles.size() < min) {
            return List.of();
        }

        Set<Long> obligatorias = new HashSet<>(filtroFinal.materiasObligatorias());
        List<Long> materias = new ArrayList<>(ofertasDisponibles.keySet());
        materias.sort(Comparator
                .comparingInt((Long materiaId) -> obligatorias.contains(materiaId) ? 0 : 1)
                .thenComparingInt(materiaId -> ofertasDisponibles.getOrDefault(materiaId, List.of()).size()));

        int[] sufMax = calcularAportesMaximos(materias, ofertasDisponibles, obligatorias, filtroFinal);
        PriorityQueue<SolucionHorario> mejores = new PriorityQueue<>(comparadorPeorPrimero());

        backtracking(
                0,
                materias,
                ofertasDisponibles,
                new ArrayList<>(),
                obligatorias,
                filtroFinal,
                0,
                sufMax,
                mejores
        );

        List<SolucionHorario> soluciones = new ArrayList<>(mejores.size());
        while (!mejores.isEmpty()) {
            soluciones.add(mejores.poll());
        }
        soluciones.sort(comparadorMejorPrimero());
        return soluciones;
    }

    private void backtracking(
            int indice,
            List<Long> materias,
            Map<Long, List<Oferta>> ofertasPorMateria,
            List<HorarioTrabajo> seleccionados,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros,
            int puntuacionActual,
            int[] sufMax,
            PriorityQueue<SolucionHorario> mejores
    ) {
        if (indice == materias.size()) {
            registrarSolucion(seleccionados, obligatorias, filtros, mejores);
            return;
        }

        if (mejores.size() >= LIMITE_OPCIONES) {
            int peorPuntuacion = mejores.peek().puntuacion();
            int maxPosible = puntuacionActual + sufMax[indice]
                    + (Boolean.TRUE.equals(filtros.evitarHuecos()) ? 5 : 0);
            if (maxPosible < peorPuntuacion) {
                return;
            }
        }

        Long materiaId = materias.get(indice);

        if (!obligatorias.contains(materiaId)) {
            backtracking(
                    indice + 1,
                    materias,
                    ofertasPorMateria,
                    seleccionados,
                    obligatorias,
                    filtros,
                    puntuacionActual,
                    sufMax,
                    mejores
            );
        }

        List<Oferta> ofertas = ofertasPorMateria.getOrDefault(materiaId, List.of());
        for (Oferta oferta : ofertas) {
            if (!cumpleRestriccionDocente(oferta, filtros.docentes())) {
                continue;
            }
            if (hayConflictoConSeleccionados(oferta.horarios(), seleccionados)) {
                continue;
            }
            if (tieneConflictoInterno(oferta)) {
                continue;
            }

            List<HorarioTrabajo> nuevosSeleccionados = new ArrayList<>(seleccionados);
            nuevosSeleccionados.addAll(oferta.horarios());

            backtracking(
                    indice + 1,
                    materias,
                    ofertasPorMateria,
                    nuevosSeleccionados,
                    obligatorias,
                    filtros,
                    puntuacionActual + aporteOferta(oferta, obligatorias, filtros),
                    sufMax,
                    mejores
            );
        }
    }

    private int[] calcularAportesMaximos(
            List<Long> materias,
            Map<Long, List<Oferta>> ofertasDisponibles,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros
    ) {
        int n = materias.size();
        int[] sufMax = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            Long materiaId = materias.get(i);
            int aporteMax = ofertasDisponibles.getOrDefault(materiaId, List.of()).stream()
                    .mapToInt(oferta -> aporteOferta(oferta, obligatorias, filtros))
                    .max().orElse(0);
            sufMax[i] = sufMax[i + 1] + aporteMax;
        }
        return sufMax;
    }

    private int aporteOferta(Oferta oferta, Set<Long> obligatorias, HorarioFiltroRequest filtros) {
        int aporte = 1;
        if (obligatorias.contains(oferta.materiaId())) {
            aporte += 10;
        }
        if (docenteEsObligatorioParaMateria(filtros.docentes(), oferta.materiaId(), oferta.docenteId())) {
            aporte += 10;
        }
        return aporte;
    }

    private Comparator<SolucionHorario> comparadorPeorPrimero() {
        return (a, b) -> {
            int porPuntuacion = Integer.compare(a.puntuacion(), b.puntuacion());
            if (porPuntuacion != 0) {
                return porPuntuacion;
            }
            return Integer.compare(a.cantidadMaterias(), b.cantidadMaterias());
        };
    }

    private Comparator<SolucionHorario> comparadorMejorPrimero() {
        return (a, b) -> {
            int porPuntuacion = Integer.compare(b.puntuacion(), a.puntuacion());
            if (porPuntuacion != 0) {
                return porPuntuacion;
            }
            return Integer.compare(b.cantidadMaterias(), a.cantidadMaterias());
        };
    }

    private void registrarSolucion(
            List<HorarioTrabajo> horarios,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros,
            PriorityQueue<SolucionHorario> mejores
    ) {
        if (horarios == null || horarios.isEmpty()) {
            return;
        }

        Set<Long> materiasEnSolucion = horarios.stream()
                .map(HorarioTrabajo::materiaId)
                .collect(Collectors.toSet());

        int min = filtros.cantidadMaterias().min() == null ? 1 : filtros.cantidadMaterias().min();
        int max = filtros.cantidadMaterias().max() == null ? 6 : filtros.cantidadMaterias().max();

        if (materiasEnSolucion.size() < min || materiasEnSolucion.size() > max) {
            return;
        }

        if (!obligatorias.isEmpty() && !obligatorias.stream().allMatch(materiasEnSolucion::contains)) {
            return;
        }

        SolucionHorario solucion = new SolucionHorario(
                materiasEnSolucion.size(),
                calcularPuntuacion(horarios, obligatorias, filtros),
                horarios);

        if (mejores.size() < LIMITE_OPCIONES) {
            mejores.add(solucion);
        } else if (comparadorPeorPrimero().compare(solucion, mejores.peek()) > 0) {
            mejores.poll();
            mejores.add(solucion);
        }
    }

    private int calcularPuntuacion(
            List<HorarioTrabajo> horarios,
            Set<Long> obligatorias,
            HorarioFiltroRequest filtros
    ) {
        Set<Long> materiasEnSolucion = horarios.stream()
                .map(HorarioTrabajo::materiaId)
                .collect(Collectors.toSet());

        int puntuacionTotal = materiasEnSolucion.size();

        for (Long materiaId : materiasEnSolucion) {
            if (obligatorias.contains(materiaId)) {
                puntuacionTotal += 10;
            }

            Long docenteId = horarios.stream()
                    .filter(horario -> horario.materiaId().equals(materiaId))
                    .findFirst()
                    .map(HorarioTrabajo::docenteId)
                    .orElse(null);
            if (docenteId != null && docenteEsObligatorioParaMateria(filtros.docentes(), materiaId, docenteId)) {
                puntuacionTotal += 10;
            }
        }

        if (Boolean.TRUE.equals(filtros.evitarHuecos()) && !tieneHueco(horarios)) {
            puntuacionTotal += 5;
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

        for (Map.Entry<Long, List<Long>> entry : docentes.entrySet()) {
            Long docenteId = entry.getKey();
            List<Long> materiasPermitidas = entry.getValue();
            if (materiasPermitidas.contains(oferta.materiaId())) {
                if (!docenteId.equals(oferta.docenteId())) {
                    return false;
                }
            }
        }

        return true;
    }

    private boolean cumpleDisponibilidad(Oferta oferta, List<HorarioBloqueFiltroRequest> noDisponibles) {
        if (noDisponibles == null || noDisponibles.isEmpty()) {
            return true;
        }

        for (HorarioTrabajo horario : oferta.horarios()) {
            for (HorarioBloqueFiltroRequest bloque : noDisponibles) {
                if (bloque == null || horario.dia() != bloque.dia()) {
                    continue;
                }
                try {
                    LocalTime inicio = LocalTime.parse(bloque.horaInicio());
                    LocalTime fin = LocalTime.parse(bloque.horaFin());
                    if (!inicio.isBefore(fin)
                            || horario.horaInicio().isBefore(fin) && horario.horaFin().isAfter(inicio)) {
                        return false;
                    }
                } catch (RuntimeException ignored) {
                    return false;
                }
            }
        }
        return true;
    }
}
