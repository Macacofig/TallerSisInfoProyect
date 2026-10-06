package com.unihub.backend.mapper.horario;

import java.util.HashMap;
import java.util.Map;

public class MapeoGeneracion {

    private final Map<String, Long> materiasPorNombre = new HashMap<>();
    private final Map<Long, String> nombresMateria = new HashMap<>();
    private final Map<String, Long> docentesPorNombre = new HashMap<>();
    private final Map<Long, String> nombresDocente = new HashMap<>();

    public Long registrarMateria(String nombre) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank()) {
            return 0L;
        }

        Long existente = materiasPorNombre.get(clave);
        if (existente != null) {
            return existente;
        }

        Long nuevoId = (long) (materiasPorNombre.size() + 1);
        materiasPorNombre.put(clave, nuevoId);
        nombresMateria.put(nuevoId, clave);
        return nuevoId;
    }

    public void registrarMateria(String nombre, Long id) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank() || id == null) {
            return;
        }

        materiasPorNombre.put(clave, id);
        nombresMateria.put(id, clave);
    }

    public Long registrarDocente(String nombre) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank()) {
            return 0L;
        }

        Long existente = docentesPorNombre.get(clave);
        if (existente != null) {
            return existente;
        }

        Long nuevoId = (long) (docentesPorNombre.size() + 1);
        docentesPorNombre.put(clave, nuevoId);
        nombresDocente.put(nuevoId, clave);
        return nuevoId;
    }

    public void registrarDocente(String nombre, Long id) {
        String clave = nombre == null ? "" : nombre.trim();
        if (clave.isBlank() || id == null) {
            return;
        }

        docentesPorNombre.put(clave, id);
        nombresDocente.put(id, clave);
    }

    public Map<String, Long> getMateriasPorNombre() {
        return materiasPorNombre;
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
