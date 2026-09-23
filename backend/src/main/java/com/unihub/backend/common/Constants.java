package com.unihub.backend.common;

public final class Constants {

    private Constants() {
    }

	// CALIFICACION DOCENTES
	public static final class CalificacionDocente {

	private CalificacionDocente() {
	}

	// Base = URL base para todos los endpoints
	public static final String BASE = "/api/calificacion-docente";

	// Crear calificacion
	public static final String CREAR_URL = BASE;
	// Que necesita: idDocente, idMateria, idEstudiante, criterios de calificacion y gestion en el body.
	public static final String CREAR_REQUIERE = "Body: idDocente, idMateria, idEstudiante, "
		+ "claridadExplicaciones, metodologia, relacionClasesEvaluaciones y gestion";
	// Que devuelve: la calificacion creada.
	public static final String CREAR_DEVUELVE = "CalificacionDocenteResponse; una calificacion por estudiante, docente y materia";

	// Obtener promedios de todos los docentes de una materia
	public static final String PROMEDIOS_POR_MATERIA_URL = BASE + "/materia/{idMateria}/docentes";
	public static final String PROMEDIOS_POR_MATERIA_REQUIERE = "Path: idMateria";
	public static final String PROMEDIOS_POR_MATERIA_DEVUELVE = "Lista de promedios agrupados por cada docente dentro de la materia";

	// Obtener la calificacion de un estudiante para un docente en una materia
	public static final String OBTENER_POR_ESTUDIANTE_URL = BASE
		+ "/estudiante/{idEstudiante}/docente/{idDocente}/materia/{idMateria}";
	public static final String OBTENER_POR_ESTUDIANTE_REQUIERE = "Path: idEstudiante, idDocente e idMateria";
	public static final String OBTENER_POR_ESTUDIANTE_DEVUELVE = "CalificacionDocenteResponse de ese estudiante "
		+ "en ese docente y materia";

	// Actualizar calificacion
	public static final String ACTUALIZAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	public static final String ACTUALIZAR_REQUIERE = OBTENER_POR_ESTUDIANTE_REQUIERE
		+ "; body con los nuevos valores de calificacion";
	public static final String ACTUALIZAR_DEVUELVE = "CalificacionDocenteResponse actualizado";

	// Eliminar calificacion
	public static final String ELIMINAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	public static final String ELIMINAR_REQUIERE = OBTENER_POR_ESTUDIANTE_REQUIERE;
	public static final String ELIMINAR_DEVUELVE = "204 No Content si se elimina; 404 si no existe";

	// Obtener gestiones disponibles de una materia
	public static final String GESTIONES_POR_MATERIA_URL = BASE + "/materia/{idMateria}/gestiones";
	public static final String GESTIONES_POR_MATERIA_REQUIERE = "Path: idMateria";
	public static final String GESTIONES_POR_MATERIA_DEVUELVE = "Lista de gestiones con calificaciones "
		+ "registradas en la materia";

	// Filtrar promedios por una gestion
	public static final String PROMEDIOS_POR_GESTION_URL = BASE + "/materia/{idMateria}/periodo/{gestion}";
	public static final String PROMEDIOS_POR_GESTION_REQUIERE = "Path: idMateria y gestion";
	public static final String PROMEDIOS_POR_GESTION_DEVUELVE = "Lista de promedios por docente filtrados "
		+ "por materia y gestion";

	// Filtrar promedios por un rango de gestiones
	public static final String PROMEDIOS_POR_RANGO_URL = BASE + "/materia/{idMateria}/periodo/rango";
	public static final String PROMEDIOS_POR_RANGO_REQUIERE = "Path: idMateria; query params: desde y hasta";
	public static final String PROMEDIOS_POR_RANGO_DEVUELVE = "Lista de promedios por docente filtrados "
		+ "por materia y rango de gestiones";
    }
}
