package com.unihub.backend.common;

public final class Constants {

    private Constants() {
    }

	// CALIFICACION DOCENTES
	public static final class CalificacionDocente {

	private CalificacionDocente() {
	}

	// Base = CALIFICACION DOCENTES
	public static final String BASE = "/api/calificacion-docente";

	// Crear calificacion docente
	public static final String CREAR_URL = BASE;
	// Que necesita: idDocente, idMateria, idEstudiante, claridadExplicaciones, metodologia, relacionClasesEvaluaciones y gestion.
	// Que devuelve: la calificacion creada.

	// Obtener promedios de todos los docentes de una materia
	public static final String PROMEDIOS_POR_MATERIA_URL = BASE + "/materia/{idMateria}/docentes";
	// Que necesita: idMateria
	// Que devuelve: Lista de promedios agrupados por cada docente dentro de la materia

	// Obtener la calificacion de un estudiante para un docente en una materia
	public static final String OBTENER_POR_ESTUDIANTE_URL = BASE + "/estudiante/{idEstudiante}/docente/{idDocente}/materia/{idMateria}";
	// Que necesita: idEstudiante, idDocente e idMateria
	// Que devuelve: CalificacionDocenteResponse de ese estudiante en ese docente y materia

	// Actualizar calificacion
	public static final String ACTUALIZAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	// Que necesita: OBTENER_POR_ESTUDIANTE_REQUIERE + body con los nuevos valores de calificacion
	// Que devuelve: "CalificacionDocenteResponse actualizado";

	// Eliminar calificacion
	public static final String ELIMINAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	// Que necesita: OBTENER_POR_ESTUDIANTE_REQUIERE
	// Que devuelve: "204 No Content si se elimina; 404 si no existe"

	// Obtener gestiones disponibles de una materia
	public static final String GESTIONES_POR_MATERIA_URL = BASE + "/materia/{idMateria}/gestiones";
	// Que necesita: idMateria
	// Que devuelve: Lista de gestiones con calificaciones 
		

	// Filtrar promedios por una gestion
	public static final String PROMEDIOS_POR_GESTION_URL = BASE + "/materia/{idMateria}/periodo/{gestion}";
	// Que necesita: idMateria y gestion
	// Que devuelve: Lista de promedios por docente filtrados

	// Filtrar promedios por un rango de gestiones
	public static final String PROMEDIOS_POR_RANGO_URL = BASE + "/materia/{idMateria}/periodo/rango";
	// Que necesita: idMateria, desde y hasta
	// Que devuelve: Lista de promedios por docente filtrados

    }

	// CALIFICACION MATERIA
	public static final class CalificacionMateria {

	private CalificacionMateria() {
	}

	// Base = CALIFICACION MATERIA
	public static final String BASE = "/api/calificacion-materia";

	// Crear calificacion materia
	public static final String CREAR_URL = BASE;
	// Que necesita: idEstudiante, idMateria y los valores de calificacion (nota, gestion)
	// Que devuelve: la calificacion creada.

	// Obtener promedios de una materia
	public static final String PROMEDIOS_POR_MATERIA_URL = BASE + "/materia/{idMateria}";
	// Que necesita: idMateria
	// Que devuelve: CalificacionMateriaPromedioResponse con el promedio de la materia (404 si no existe)

	// Obtener promedios de todas las materias
	public static final String PROMEDIOS_MATERIAS_URL = BASE + "/promedios/materias";
	// Que necesita: nada
	// Que devuelve: Lista de CalificacionMateriaPromedioMateriaResponse

	// Obtener la calificacion de un estudiante en una materia
	public static final String OBTENER_POR_ESTUDIANTE_URL = BASE + "/estudiante/{idEstudiante}/materia/{idMateria}";
	// Que necesita: idEstudiante e idMateria
	// Que devuelve: CalificacionMateriaResponse de ese estudiante en esa materia

	// Actualizar calificacion
	public static final String ACTUALIZAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	// Que necesita: idEstudiante, idMateria + body con los nuevos valores de calificacion
	// Que devuelve: CalificacionMateriaResponse actualizado (404 si no existe)

	// Eliminar calificacion
	public static final String ELIMINAR_URL = OBTENER_POR_ESTUDIANTE_URL;
	// Que necesita: idEstudiante e idMateria
	// Que devuelve: 204 No Content si se elimina; 404 si no existe

	// Obtener promedios de una gestion
	public static final String PROMEDIOS_POR_GESTION_URL = BASE + "/periodo/{gestion}";
	// Que necesita: gestion
	// Que devuelve: CalificacionMateriaPromedioResponse con las materias filtradas por gestion (404 si no existe)

	// Obtener gestiones disponibles
	public static final String GESTIONES_URL = BASE + "/gestiones";
	// Que necesita: nada
	// Que devuelve: Lista de gestiones disponibles

	// Obtener promedios por un rango de gestiones
	public static final String PROMEDIOS_POR_RANGO_URL = BASE + "/periodo/rango";
	// Que necesita: desde y hasta
	// Que devuelve: CalificacionMateriaPromedioResponse filtrado por el rango de gestiones (404 si no existe)

	}

	// DOCENTES
	public static final class Docente {

	private Docente() {
	}

	// Base = DOCENTES
	public static final String BASE = "/api/docentes";

	// Agregar un docente
	public static final String AGREGAR_URL = BASE;
	// Que necesita: body DocenteRequest (nombre, ...)
	// Que devuelve: DocenteResponse creado

	// Obtener docentes de una materia
	public static final String POR_MATERIA_URL = BASE + "/materia/{idMateria}";
	// Que necesita: idMateria
	// Que devuelve: Lista de DocenteResponse de esa materia

	}

	// DOCENTE MATERIA
	public static final class DocenteMateria {

	private DocenteMateria() {
	}

	// Base = DOCENTE MATERIA
	public static final String BASE = "/api/docente-materia";

	// Crear relacion docente-materia
	public static final String CREAR_URL = BASE;
	// Que necesita: body DocenteMateriaRequest (idDocente, idMateria, ...)
	// Que devuelve: DocenteMateriaResponse creado


	}

	// ESTUDIANTES
	public static final class Estudiante {

	private Estudiante() {
	}

	// Base = ESTUDIANTES
	public static final String BASE = "/api/estudiantes";

	// Registrar un estudiante
	public static final String REGISTRAR_URL = BASE;
	// Que necesita: body EstudianteRequest
	// Que devuelve: EstudianteResponse creado

	// Actualizar un estudiante
	public static final String ACTUALIZAR_URL = BASE + "/{id}";
	// Que necesita: id y body EstudianteActualizacionRequest
	// Que devuelve: EstudianteResponse actualizado

	// Iniciar sesion de un estudiante
	public static final String LOGIN_URL = BASE + "/login";
	// Que necesita: body EstudianteLoginRequest (correo, ...)
	// Que devuelve: EstudianteLoginResponse con sesion/token

	}

	// MATERIAS
	public static final class Materia {

	private Materia() {
	}

	// Base = MATERIAS
	public static final String BASE = "/api/materias";

	// Obtener carreras
	public static final String CARRERAS_URL = BASE + "/carreras";
	// Que necesita: nada
	// Que devuelve: Lista de carreras

	// Obtener materias (con filtros opcionales)
	public static final String OBTENER_URL = BASE;
	// Que necesita: nombre, carrera y semestre (todos opcionales)
	// Que devuelve: Lista de MateriaResponse filtrada

	}

	// HORARIOS
	public static final class Horario {

	private Horario() {
	}

	// Base = HORARIOS
	public static final String BASE = "/api/horarios";

	// Normalizar materias crudas de entrada
	public static final String OBTENER_DATOS_URL = BASE + "/obtenerDatos";
	// Que necesita: body Lista de HorarioMateriaRequest
	// Que devuelve: HorarioNormalizacionResponse con las materias normalizadas

	// Generar horarios
	public static final String GENERAR_URL = BASE + "/generarhorarios";
	// Que necesita: body HorarioGeneracionRequest
	// Que devuelve: Lista de HorarioResponse2 con los horarios generados


	}

	// TEST
	public static final class Test {

	private Test() {
	}

	//================================================================//
	// Base = TEST
	public static final String BASE = "/api/test";
	// Que necesita: nada
	// Que devuelve: mensaje de estado de la API

	//================================================================//

	}

}