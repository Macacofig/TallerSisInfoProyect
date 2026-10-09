package com.unihub.backend.mapper.horario;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.ClassHelpers.Horario.SolucionHorario;
import com.unihub.backend.common.DiaSemana;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import com.unihub.backend.dto.horario.HorarioBloqueGeneradoResponse;
import com.unihub.backend.dto.horario.HorarioBloqueResponse;
import com.unihub.backend.dto.horario.HorarioBloqueResultadoResponse;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioOfertaResponse;
import com.unihub.backend.dto.horario.HorarioResponse1;
import com.unihub.backend.dto.horario.HorarioResponse2;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class HorarioMapper {

    public MapeoGeneracion crearMapeo(List<HorarioMateriaRequest> materias) {
        MapeoGeneracion mapeo = new MapeoGeneracion();
        if (materias == null) {
            return mapeo;
        }

        for (HorarioMateriaRequest materia : materias) {
            if (materia == null) {
                continue;
            }

            String nombreMateria = nombreMateria(materia);
            if (nombreMateria.isBlank() && texto(materia.siglaMateria1()).isBlank()) {
                continue;
            }

            mapeo.registrarMateria(materia.siglaMateria1(), nombreMateria);
            if (materia.horarios() == null) {
                continue;
            }

            for (HorarioBloqueRequest bloque : materia.horarios()) {
                if (bloque == null) {
                    continue;
                }
                String docente = bloque.docenteNombre1();
                if (docente != null && !docente.isBlank()) {
                    mapeo.registrarDocente(docente);
                }
            }
        }

        return mapeo;
    }

    public List<HorarioTrabajo> toHorarioTrabajo(List<HorarioMateriaRequest> materias, MapeoGeneracion mapeo) {
        List<HorarioTrabajo> horarios = new ArrayList<>();
        if (materias == null || mapeo == null) {
            return horarios;
        }

        for (HorarioMateriaRequest materia : materias) {
            if (materia == null) {
                continue;
            }

            Long materiaId = resolveMateriaId(mapeo, materia.siglaMateria1(), nombreMateria(materia));
            if (materiaId == null || materia.horarios() == null) {
                continue;
            }

            int paralelo = materia.paralelo1() == null ? 1 : materia.paralelo1();
            for (HorarioBloqueRequest bloque : materia.horarios()) {
                if (bloque == null || bloque.dia() < 1 || bloque.dia() > 7) {
                    continue;
                }

                String docente = bloque.docenteNombre1();
                Long docenteId = resolveDocenteId(mapeo, docente);
                if (docenteId == null) {
                    continue;
                }

                LocalTime[] rango = parseHoras(bloque.horas());
                if (rango == null) {
                    continue;
                }
                horarios.add(new HorarioTrabajo(materiaId, docenteId, bloque.dia(), rango[0], rango[1], paralelo));
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

        Map<String, Oferta> ofertasPorClave = new LinkedHashMap<>();
        for (HorarioTrabajo horario : horarios) {
            String clave = horario.materiaId() + "-" + horario.paralelo() + "-" + horario.docenteId();
            Oferta ofertaActual = ofertasPorClave.get(clave);
            if (ofertaActual == null) {
                List<HorarioTrabajo> bloques = new ArrayList<>();
                if (agregarBloqueUnico(bloques, horario)) {
                    ofertasPorClave.put(clave, new Oferta(horario.materiaId(), horario.docenteId(), horario.paralelo(), bloques));
                }
            } else {
                List<HorarioTrabajo> bloques = new ArrayList<>(ofertaActual.horarios());
                if (agregarBloqueUnico(bloques, horario)) {
                    ofertasPorClave.put(clave, new Oferta(horario.materiaId(), horario.docenteId(), horario.paralelo(), bloques));
                }
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

    public List<HorarioResponse1> toResponse1(List<HorarioMateriaRequest> materias, MapeoGeneracion mapeo) {
        Map<Long, List<Oferta>> ofertasPorMateria = agruparPorMateria(toHorarioTrabajo(materias, mapeo));
        List<HorarioResponse1> respuestas = new ArrayList<>();
        ofertasPorMateria.forEach((materiaId, ofertas) -> {
            List<HorarioOfertaResponse> ofertasResponse = ofertas.stream().map(oferta -> new HorarioOfertaResponse(
                    oferta.docenteId(),
                    mapeo.getNombresDocente().getOrDefault(oferta.docenteId(), "Docente desconocido"),
                    oferta.paralelo(),
                    oferta.horarios().stream().map(horario -> new HorarioBloqueResponse(
                            DiaSemana.nombre(horario.dia()), horario.horaInicio() + " - " + horario.horaFin()
                    )).toList()
            )).toList();
            respuestas.add(new HorarioResponse1(materiaId,
                    mapeo.getNombresMateria().getOrDefault(materiaId, "Materia desconocida"), ofertasResponse));
        });
        return respuestas;
    }

    public List<HorarioResponse2> toResponse2(List<SolucionHorario> soluciones, MapeoGeneracion mapeo) {
        if (soluciones == null) {
            return List.of();
        }
        return soluciones.stream().map(solucion -> {
            Map<String, List<HorarioTrabajo>> grupos = new LinkedHashMap<>();
            for (HorarioTrabajo horario : solucion.horarios()) {
                String clave = horario.materiaId() + ":" + horario.docenteId() + ":" + horario.paralelo();
                grupos.computeIfAbsent(clave, ignored -> new ArrayList<>()).add(horario);
            }
            List<HorarioBloqueResultadoResponse> horarios = grupos.values().stream().map(bloques -> {
                HorarioTrabajo primero = bloques.getFirst();
                List<HorarioBloqueGeneradoResponse> bloquesResponse = bloques.stream()
                        .sorted(Comparator.comparingInt(HorarioTrabajo::dia).thenComparing(HorarioTrabajo::horaInicio))
                        .map(horario -> new HorarioBloqueGeneradoResponse(
                                DiaSemana.nombre(horario.dia()),
                                horario.horaInicio().toString(), horario.horaFin().toString()))
                        .toList();
                return new HorarioBloqueResultadoResponse(
                        mapeo.getNombresMateria().getOrDefault(primero.materiaId(), "Materia desconocida"),
                        mapeo.getNombresDocente().getOrDefault(primero.docenteId(), "Docente desconocido"),
                        bloquesResponse);
            }).toList();
            return new HorarioResponse2(solucion.cantidadMaterias(), solucion.puntuacion(), horarios);
        }).toList();
    }

    private Long resolveMateriaId(MapeoGeneracion mapeo, String sigla, String nombreMateria) {
        if (sigla != null && !sigla.isBlank()) {
            Long porSigla = mapeo.getMateriasPorSigla().get(MapeoGeneracion.normalizarTexto(sigla));
            if (porSigla != null) {
                return porSigla;
            }
        }
        if (nombreMateria != null && !nombreMateria.isBlank()) {
            Long porNombre = mapeo.getMateriasPorNombre().get(MapeoGeneracion.normalizarTexto(nombreMateria));
            if (porNombre != null) {
                return porNombre;
            }
        }
        return null;
    }

    private Long resolveDocenteId(MapeoGeneracion mapeo, String docente) {
        if (docente == null || docente.isBlank()) {
            return null;
        }

        Long docenteId = mapeo.getDocentesPorNombre().get(MapeoGeneracion.normalizarTexto(docente));
        if (docenteId != null) {
            return docenteId;
        }

        return mapeo.registrarDocente(docente);
    }

    private LocalTime parseHora(String hora) {
        if (hora == null || hora.isBlank()) {
            return null;
        }

        String limpio = hora.trim();
        try {
            return LocalTime.parse(limpio);
        } catch (Exception ignored) {
            return null;
        }
    }

    private LocalTime[] parseHoras(String horas) {
        if (horas == null || horas.isBlank()) {
            return null;
        }
        String[] partes = horas.trim().split("\\s*-\\s*");
        if (partes.length != 2) {
            return null;
        }
        try {
            LocalTime inicio = LocalTime.parse(partes[0]);
            LocalTime fin = LocalTime.parse(partes[1]);
            return inicio.isBefore(fin) ? new LocalTime[] { inicio, fin } : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private String nombreMateria(HorarioMateriaRequest materia) {
        String nombre = materia.nombreMateria1();
        return nombre == null || nombre.isBlank() ? materia.siglaMateria1() : nombre;
    }

    private String texto(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean agregarBloqueUnico(List<HorarioTrabajo> bloques, HorarioTrabajo horario) {
        if (horario == null) {
            return false;
        }

        Set<String> claveBloques = new HashSet<>();
        for (HorarioTrabajo existente : bloques) {
            claveBloques.add(claveBloque(existente));
        }

        String clave = claveBloque(horario);
        if (!claveBloques.contains(clave)) {
            bloques.add(horario);
            return true;
        }

        return false;
    }

    private String claveBloque(HorarioTrabajo horario) {
        return horario.dia() + "|" + horario.horaInicio() + "|" + horario.horaFin();
    }
}
