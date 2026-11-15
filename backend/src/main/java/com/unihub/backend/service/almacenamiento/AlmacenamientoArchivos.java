package com.unihub.backend.service.almacenamiento;

public interface AlmacenamientoArchivos {

    /**
     * Sube un archivo y devuelve su URL pública junto con la ruta interna usada
     * en el almacenamiento.
     */
    ArchivoAlmacenado subir(byte[] contenido, String nombreOriginal, String contentType, String carpeta);

    /**
     * Elimina un archivo usando la ruta interna devuelta por {@link #subir}.
     */
    void eliminar(String ruta);
}
