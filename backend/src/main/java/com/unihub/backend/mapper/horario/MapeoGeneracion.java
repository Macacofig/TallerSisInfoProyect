package com.unihub.backend.mapper.horario;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MapeoGeneracion {

    private long siguienteMateriaId = 1L;
    private long siguienteDocenteId = 1L;

    private final Map<String, Long> materiasPorNombre = new HashMap<>();
    private final Map<String, Long> materiasPorSigla = new HashMap<>();
    private final Map<Long, String> nombresMateria = new HashMap<>();
    private final Map<String, Long> docentesPorNombre = new HashMap<>();
    private final Map<Long, String> nombresDocente = new HashMap<>();

    public static String normalizarTexto(String valor) {
        if (valor == null) {
            return "";
        }

        String limpio = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
        return limpio;
    }

    public static String mostrarTexto(String valor) {
        if (valor == null) {
            return "";
        }

        return valor.trim().replaceAll("\\s+", " ");
    }

    public Long registrarMateria(String nombre) {
        return registrarMateria(null, nombre, null);
    }

    public Long registrarMateria(String sigla, String nombre) {
        return registrarMateria(sigla, nombre, null);
    }

    public Long registrarMateria(String sigla, String nombre, Long id) {
        String nombreNormalizado = normalizarTexto(nombre);
        String siglaNormalizada = normalizarTexto(sigla);
        if (nombreNormalizado.isBlank() && siglaNormalizada.isBlank()) {
            return 0L;
        }

        Long materiaId = id;
        if (materiaId == null) {
            if (!siglaNormalizada.isBlank() && materiasPorSigla.containsKey(siglaNormalizada)) {
                return materiasPorSigla.get(siglaNormalizada);
            }
            if (!nombreNormalizado.isBlank() && materiasPorNombre.containsKey(nombreNormalizado)) {
                return materiasPorNombre.get(nombreNormalizado);
            }
            materiaId = siguienteMateriaId++;
        } else {
            siguienteMateriaId = Math.max(siguienteMateriaId, materiaId + 1);
        }

        if (!siglaNormalizada.isBlank()) {
            materiasPorSigla.put(siglaNormalizada, materiaId);
        }

        if (!nombreNormalizado.isBlank()) {
            materiasPorNombre.put(nombreNormalizado, materiaId);
            materiasPorNombre.put(mostrarTexto(nombre), materiaId);
            nombresMateria.putIfAbsent(materiaId, mostrarTexto(nombre));
        }

        if (sigla != null && !sigla.trim().isBlank()) {
            nombresMateria.putIfAbsent(materiaId, mostrarTexto(nombre));
        }

        return materiaId;
    }

    public void registrarMateria(String nombre, Long id) {
        registrarMateria(null, nombre, id);
    }

    public Long registrarDocente(String nombre) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank()) {
            return 0L;
        }

        String claveNormalizada = normalizarTexto(clave);
        Long existente = docentesPorNombre.get(claveNormalizada);
        if (existente != null) {
            return existente;
        }

        Long nuevoId = siguienteDocenteId++;
        docentesPorNombre.put(claveNormalizada, nuevoId);
        docentesPorNombre.put(clave, nuevoId);
        nombresDocente.put(nuevoId, mostrarTexto(clave));
        return nuevoId;
    }

    public void registrarDocente(String nombre, Long id) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank() || id == null) {
            return;
        }

        docentesPorNombre.put(normalizarTexto(clave), id);
        docentesPorNombre.put(clave, id);
        nombresDocente.put(id, mostrarTexto(clave));
        siguienteDocenteId = Math.max(siguienteDocenteId, id + 1);
    }

    public Map<String, Long> getMateriasPorNombre() {
        return materiasPorNombre;
    }

    public Map<String, Long> getMateriasPorSigla() {
        return materiasPorSigla;
    }

    public Map<Long, String> getNombresMateria() {
        return nombresMateria;
    }

    public Map<String, Long> getDocentesPorNombre() {
        return docentesPorNombre;
    }

    public Map<Long, String> getNombresDocente() {
        return nombresDocente;
    }
}
