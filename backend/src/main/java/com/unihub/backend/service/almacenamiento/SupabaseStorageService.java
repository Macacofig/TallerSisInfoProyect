package com.unihub.backend.service.almacenamiento;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.exception.AlmacenamientoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

/**
 * Almacena archivos en un bucket de Supabase Storage usando su API HTTP.
 *
 * Requiere las variables de entorno SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY. El bucket se crea automáticamente como público
 * para que la URL guardada en la base de datos pueda abrirse directamente.
 */
@Service
public class SupabaseStorageService implements AlmacenamientoArchivos {

    private static final Duration TIEMPO_CONEXION = Duration.ofSeconds(10);
    private static final Duration TIEMPO_RESPUESTA = Duration.ofSeconds(60);
    private static final int LONGITUD_MAXIMA_ERROR = 300;

    private final HttpClient httpClient;
    private final String urlProyecto;
    private final String claveServicio;
    private final String bucket;

    private volatile boolean bucketVerificado;

    public SupabaseStorageService(
            @Value("${app.supabase.url:}") String urlProyecto,
            @Value("${app.supabase.service-role-key:}") String claveServicio,
            @Value("${app.supabase.storage.bucket:materiales}") String bucket
    ) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(TIEMPO_CONEXION)
                .build();
        this.urlProyecto = normalizarUrlProyecto(urlProyecto);
        this.claveServicio = claveServicio == null ? "" : claveServicio.trim();
        this.bucket = bucket == null ? "materiales" : bucket.trim();
    }

    @Override
    public ArchivoAlmacenado subir(byte[] contenido, String nombreOriginal, String contentType, String carpeta) {
        validarConfiguracion();
        validarBucket();
        asegurarBucket();

        String rutaObjeto = construirRutaObjeto(carpeta, nombreOriginal);
        String urlCarga = urlProyecto + "/storage/v1/object/" + bucket + "/" + rutaObjeto;

        HttpRequest solicitud = solicitudBase(urlCarga)
                .header("Content-Type", contentType)
                .header("x-upsert", "false")
                .POST(HttpRequest.BodyPublishers.ofByteArray(contenido))
                .build();

        HttpResponse<String> respuesta = enviar(solicitud, "subir el archivo");

        if (respuesta.statusCode() < 200 || respuesta.statusCode() >= 300) {
            throw new AlmacenamientoException(
                    "Supabase Storage rechazó el archivo (HTTP " + respuesta.statusCode() + "): "
                            + recortar(respuesta.body()));
        }

        String urlPublica = urlProyecto + "/storage/v1/object/public/" + bucket + "/" + rutaObjeto;
        LogHelper.info(SupabaseStorageService.class, "Archivo subido a Supabase Storage: " + rutaObjeto);
        return new ArchivoAlmacenado(urlPublica, rutaObjeto);
    }

    @Override
    public void eliminar(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            return;
        }

        try {
            validarConfiguracion();
            String urlEliminar = urlProyecto + "/storage/v1/object/" + bucket + "/" + ruta;
            HttpRequest solicitud = solicitudBase(urlEliminar)
                    .DELETE()
                    .build();
            HttpResponse<String> respuesta = enviar(solicitud, "eliminar el archivo");

            if (respuesta.statusCode() < 200 || respuesta.statusCode() >= 300) {
                LogHelper.warn(SupabaseStorageService.class,
                        "No se pudo eliminar el archivo de Supabase Storage (HTTP "
                                + respuesta.statusCode() + ")");
            }
        } catch (RuntimeException exception) {
            LogHelper.error(SupabaseStorageService.class,
                    "Error al intentar eliminar el archivo de Supabase Storage", exception);
        }
    }

    private void asegurarBucket() {
        if (bucketVerificado) {
            return;
        }

        synchronized (this) {
            if (bucketVerificado) {
                return;
            }

            String urlBucket = urlProyecto + "/storage/v1/bucket/" + bucket;
            HttpResponse<String> consulta = enviar(
                    solicitudBase(urlBucket).GET().build(),
                    "consultar el bucket");

            if (consulta.statusCode() == 200) {
                bucketVerificado = true;
                return;
            }

            if (consulta.statusCode() != 404) {
                throw new AlmacenamientoException(
                        "No se pudo consultar el bucket '" + bucket + "' (HTTP "
                                + consulta.statusCode() + "): " + recortar(consulta.body()));
            }

            String cuerpo = "{\"id\":\"" + bucket + "\",\"name\":\"" + bucket + "\",\"public\":true}";
            HttpResponse<String> creacion = enviar(
                    solicitudBase(urlProyecto + "/storage/v1/bucket")
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(cuerpo))
                            .build(),
                    "crear el bucket");

            if (creacion.statusCode() >= 200 && creacion.statusCode() < 300) {
                bucketVerificado = true;
                LogHelper.info(SupabaseStorageService.class,
                        "Bucket de Supabase Storage creado: " + bucket);
                return;
            }

            throw new AlmacenamientoException(
                    "No se pudo crear el bucket '" + bucket + "' (HTTP "
                            + creacion.statusCode() + "): " + recortar(creacion.body()));
        }
    }

    private HttpRequest.Builder solicitudBase(String url) {
        return HttpRequest.newBuilder(URI.create(url))
                .timeout(TIEMPO_RESPUESTA)
                .header("Authorization", "Bearer " + claveServicio)
                .header("apikey", claveServicio);
    }

    private HttpResponse<String> enviar(HttpRequest solicitud, String accion) {
        try {
            return httpClient.send(solicitud, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AlmacenamientoException("Se interrumpió la operación al " + accion, exception);
        } catch (IOException exception) {
            throw new AlmacenamientoException(
                    "No se pudo conectar con Supabase Storage al " + accion, exception);
        }
    }

    private void validarConfiguracion() {
        if (urlProyecto.isBlank()) {
            throw new AlmacenamientoException(
                    "SUPABASE_URL no está configurada. No es posible usar Supabase Storage.");
        }
        if (claveServicio.isBlank()) {
            throw new AlmacenamientoException(
                    "SUPABASE_SERVICE_ROLE_KEY no está configurada. "
                            + "Agrega la clave service_role del proyecto de Supabase para subir archivos.");
        }
    }

    private void validarBucket() {
        if (!bucket.matches("[a-z0-9][a-z0-9._-]{1,62}")) {
            throw new AlmacenamientoException(
                    "El nombre del bucket de Supabase Storage no es válido: " + bucket);
        }
    }

    private String construirRutaObjeto(String carpeta, String nombreOriginal) {
        String carpetaLimpia = limpiarSegmento(carpeta, "materiales");
        String nombreLimpio = limpiarNombreArchivo(nombreOriginal);
        return carpetaLimpia + "/" + UUID.randomUUID() + "-" + nombreLimpio;
    }

    private String limpiarSegmento(String valor, String valorPredeterminado) {
        if (valor == null || valor.isBlank()) {
            return valorPredeterminado;
        }
        return valor.trim().replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private String limpiarNombreArchivo(String nombreOriginal) {
        String nombre = nombreOriginal == null || nombreOriginal.isBlank()
                ? "archivo"
                : nombreOriginal.trim();

        nombre = nombre.substring(Math.max(nombre.lastIndexOf('/'), nombre.lastIndexOf('\\')) + 1);
        nombre = nombre.replaceAll("[^A-Za-z0-9._-]", "_");

        if (nombre.isBlank()) {
            return "archivo";
        }

        return nombre.length() > 120 ? nombre.substring(nombre.length() - 120) : nombre;
    }

    private String normalizarUrlProyecto(String url) {
        if (url == null) {
            return "";
        }
        return url.trim().replaceAll("/+$", "");
    }

    private String recortar(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.length() <= LONGITUD_MAXIMA_ERROR
                ? texto
                : texto.substring(0, LONGITUD_MAXIMA_ERROR) + "...";
    }
}
