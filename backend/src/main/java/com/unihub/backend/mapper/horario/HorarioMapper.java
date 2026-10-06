package com.unihub.backend.mapper.horario;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.ClassHelpers.Horario.SolucionHorario;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import com.unihub.backend.dto.horario.HorarioBloqueResultadoResponse;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioOfertaRequest;
import com.unihub.backend.dto.horario.HorarioResponse;
import com.unihub.backend.dto.horario.HorarioResultadoResponse;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class HorarioMapper {

    public MapeoGeneracion crearMapeo(List<HorarioMateriaRequest> materias) {
        MapeoGeneracion mapeo = new MapeoGeneracion();
        if (materias == null) {
            return mapeo;
        }

        for (HorarioMateriaRequest materia : materias) {
            if (materia == null || materia.nombre() == null) {
                continue;
            }

            Long materiaId = mapeo.registrarMateria(materia.nombre());
            if (materiaId == null || materiaId == 0L) {
                continue;
            }

            if (materia.ofertas() == null) {
                continue;
            }

            for (HorarioOfertaRequest oferta : materia.ofertas()) {
                if (oferta == null || oferta.docente() == null) {
                    continue;
                }
                mapeo.registrarDocente(oferta.docente());
            }
        }

        return mapeo;
    }

    public List<HorarioTrabajo> toHorarioTrabajo(List<HorarioMateriaRequest> materias, MapeoGeneracion mapeo) {
        List<HorarioTrabajo> horarios = new ArrayList<>();
        if (materias == null || mapeo == null) {
            return horarios;
        }

        Map<String, Integer> paralelos = new HashMap<>();

        for (HorarioMateriaRequest materia : materias) {
            if (materia == null || materia.nombre() == null || materia.ofertas() == null) {
                continue;
            }

            Long materiaId = mapeo.getMateriasPorNombre().get(materia.nombre());
            if (materiaId == null) {
                continue;
            }

            for (HorarioOfertaRequest oferta : materia.ofertas()) {
                if (oferta == null || oferta.docente() == null || oferta.horarios() == null) {
                    continue;
                }

                Long docenteId = mapeo.getDocentesPorNombre().get(oferta.docente());
                String clave = materiaId + ":" + docenteId;
                int paralelo = paralelos.getOrDefault(clave, 0) + 1;
                paralelos.put(clave, paralelo);

                for (HorarioBloqueRequest bloque : oferta.horarios()) {
                    if (bloque == null) {
                        continue;
                    }
                    horarios.add(new HorarioTrabajo(
                            materiaId,
                            docenteId,
                            bloque.dia(),
                            LocalTime.parse(bloque.horaInicio()),
                            LocalTime.parse(bloque.horaFin()),
                            paralelo,
                            1
                    ));
                }
            }
        }

        horarios.sort(Comparator.comparing(HorarioTrabajo::materiaId)
                .thenComparing(HorarioTrabajo::docenteId)
                .thenComparingInt(HorarioTrabajo::paralelo)
                .thenComparing(HorarioTrabajo::dia)
                .thenComparing(HorarioTrabajo::horaInicio));

        return horarios;
    }

    public Map<Long, List<Oferta>> agruparPorMateria(List<HorarioTrabajo> horarios) {
        Map<Long, List<Oferta>> resultado = new HashMap<>();
        if (horarios == null) {
            return resultado;
        }

        Map<String, Oferta> ofertasPorClave = new HashMap<>();
        for (HorarioTrabajo horario : horarios) {
            String clave = horario.materiaId() + "-" + horario.docenteId() + "-" + horario.paralelo();
            Oferta ofertaActual = ofertasPorClave.get(clave);
            if (ofertaActual == null) {
                List<HorarioTrabajo> bloques = new ArrayList<>();
                bloques.add(horario);
                ofertaActual = new Oferta(horario.materiaId(), horario.docenteId(), horario.paralelo(), bloques, 1);
                ofertasPorClave.put(clave, ofertaActual);
            } else {
                List<HorarioTrabajo> bloques = new ArrayList<>(ofertaActual.horarios());
                bloques.add(horario);
                ofertaActual = new Oferta(horario.materiaId(), horario.docenteId(), horario.paralelo(), bloques, 1);
                ofertasPorClave.put(clave, ofertaActual);
            }
        }

        for (Oferta oferta : ofertasPorClave.values()) {
            resultado.computeIfAbsent(oferta.materiaId(), ignored -> new ArrayList<>()).add(oferta);
        }

        for (List<Oferta> ofertas : resultado.values()) {
            ofertas.sort(Comparator.comparing(Oferta::paralelo));
        }

        return resultado;
    }

    public HorarioResponse toResponse(List<SolucionHorario> soluciones, MapeoGeneracion mapeo) {
        List<HorarioResultadoResponse> resultados = new ArrayList<>();
        if (soluciones == null) {
            return new HorarioResponse(resultados);
        }

        for (SolucionHorario solucion : soluciones) {
            List<HorarioBloqueResultadoResponse> bloques = new ArrayList<>();
            for (HorarioTrabajo horario : solucion.horarios()) {
                bloques.add(new HorarioBloqueResultadoResponse(
                        mapeo.getNombresMateria().getOrDefault(horario.materiaId(), "Materia desconocida"),
                        mapeo.getNombresDocente().getOrDefault(horario.docenteId(), "Docente desconocido"),
                        horario.dia(),
                        horario.horaInicio() + "-" + horario.horaFin()
                ));
            }
            resultados.add(new HorarioResultadoResponse(
                    solucion.cantidadMaterias(),
                    solucion.puntuacion(),
                    bloques
            ));
        }

        return new HorarioResponse(resultados);
    }
}
