package com.unihub.backend.dto.material;

/**
 * Contenido de un material listo para ser devuelto como descarga.
 *
 * @param contenido bytes del archivo
 * @param nombreArchivo nombre con la extensión original del archivo
 */
public record MaterialDescarga(
        byte[] contenido,
        String nombreArchivo
) {
}
