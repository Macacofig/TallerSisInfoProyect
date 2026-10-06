# LogHelper del backend

## Propósito

`com.unihub.backend.common.LogHelper` centraliza el acceso a SLF4J para que los registros usen el sistema de logging de Spring Boot. El helper es una clase utilitaria sin estado mutable, resuelve el logger a partir de la clase de origen y no requiere inyección de dependencias.

`src/main/resources/logback.xml` configura dos destinos. La consola conserva fecha y hora y muestra solo nivel y mensaje; los detalles de excepción no se imprimen allí. El archivo incluye fecha, hora, nivel, componente, mensaje y stack trace completo.

## Alcance actual

- `EstudianteService`: INFO al registrar y actualizar un estudiante; DEBUG al completar un inicio de sesión. No se registran datos de la cuenta.
- `DocenteService`: INFO al registrar un docente.
- `DocenteMateriaService`: INFO al crear una relación docente-materia.
- `CalificacionMateriaService`: INFO al crear, actualizar o eliminar una calificación.
- `CalificacionDocenteService`: INFO al crear, actualizar o eliminar una calificación.
- `GlobalExceptionHandler`: ERROR cuando se rechaza un inicio de sesión por credenciales inválidas (HTTP 401), sin registrar correo ni contraseña. WARN para solicitudes inválidas, recursos no encontrados, docente inexistente y calificación duplicada; también mantiene sus respuestas HTTP 400, 404 y 409.

Las consultas de lectura no generan logs de éxito para evitar volumen innecesario. Los servicios lanzan las excepciones de negocio y el advice global las registra y traduce a HTTP, evitando duplicar el registro en cada controlador. Las excepciones no contempladas por estos manejadores mantienen el procesamiento predeterminado de Spring MVC; no se agregó un manejador general que cambie las respuestas HTTP.

## Acciones desde el frontend

- INFO: una operación exitosa de registro mediante `AuthService.registerUser()` o una actualización mediante `AuthService.actualizarUsuario()`.
- ERROR: enviar credenciales incorrectas desde el formulario de login; el formulario llama a `AuthService.loginUser()`, y el backend registra un mensaje genérico y responde HTTP 401.
- WARN: intentar registrar un estudiante usando un correo ya registrado mediante `AuthService.registerUser()`. El backend registra el correo en el WARN, responde HTTP 409 y la UI muestra `El correo ya ha sido registrado`. También se registra WARN al duplicar una calificación docente mediante `CalificacionesDocenteService.registrarCalificacion()`; ese caso responde HTTP 409.

No se debe invocar `LogHelper` desde Angular: el frontend dispara la operación y el backend registra el evento donde conoce el resultado. Para provocar el WARN de registro, intenta registrar un correo existente en un entorno de desarrollo; no uses datos personales reales.

## Uso en nuevas implementaciones

Importa el helper y pasa explícitamente la clase de origen:

```java
import com.unihub.backend.common.LogHelper;

LogHelper.info(MiServicio.class, "Operación completada");
LogHelper.warn(MiServicio.class, "Solicitud rechazada por una validación");
LogHelper.debug(MiServicio.class, "Detalle útil solo durante el desarrollo");
LogHelper.error(MiServicio.class, "No se pudo completar la operación", exception);
```

Registra eventos en la capa que conoce su resultado, normalmente el servicio después de una escritura confirmada, o en el manejador que ya transforma una excepción en una respuesta HTTP. Evita registrar el mismo evento en controlador y servicio, y no captures una excepción únicamente para registrarla y relanzarla.

Para conservar toda la excepción y su stack trace, pasa el objeto `Throwable` al método `error`; no concatenes `exception.getMessage()` en su lugar. Los rechazos de validación esperados pueden registrarse como WARN sin stack trace cuando no representan un fallo interno.

No incluyas contraseñas, tokens, credenciales, cuerpos de solicitudes, datos personales ni mensajes de excepción que puedan contenerlos. Prefiere descripciones de evento genéricas. INFO debe reservarse para eventos operativos relevantes; usa DEBUG para diagnósticos detallados o de alta frecuencia.

## Configuración y almacenamiento

Los appenders están en `src/main/resources/logback.xml`. `logs/unihub.log` se crea automáticamente al arrancar; se rota por fecha o al alcanzar 10 MB, se guardan hasta 14 días y los archivos históricos tienen un límite total de 200 MB.

En ejecución local, el archivo se escribe en `backend/logs/unihub.log`. Docker Compose monta `./backend/logs` en `/app/logs`, por lo que los registros sobreviven al reinicio o recreación del contenedor. Los archivos generados se excluyen del control de versiones.

La configuración adicional está en `src/main/resources/application.properties`:

- `LOG_LEVEL` define el nivel mínimo de `com.unihub.backend`; por defecto es `INFO`. Puede establecerse, por ejemplo, en `DEBUG` durante desarrollo.
- `HIBERNATE_SQL_LOG_LEVEL` controla `org.hibernate.SQL`; por defecto es `OFF`. Establécelo en `DEBUG` temporalmente para depuración de consultas.
- El logger de `DefaultHandlerExceptionResolver` está en `ERROR` para evitar los WARN predeterminados de validación, que pueden incluir valores rechazados de campos sensibles. Los errores permanecen habilitados.

No se agregó una dependencia de logging: SLF4J y Logback son proporcionados por Spring Boot. `spring.jpa.show-sql` queda desactivado para que las consultas no eludan el formato de logging configurado.

## Prueba

`LogHelperTest` verifica los cuatro niveles, el patrón de consola sin stack trace y que `logs/unihub.log` conserva tipo y stack trace completo de una excepción.