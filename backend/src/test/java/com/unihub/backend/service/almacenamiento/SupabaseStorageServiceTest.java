package com.unihub.backend.service.almacenamiento;

import com.unihub.backend.exception.AlmacenamientoException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SupabaseStorageServiceTest {

    @Test
    void exigeLaUrlDelProyectoAntesDeSubir() {
        SupabaseStorageService servicio = new SupabaseStorageService("", "clave", "materiales");

        AlmacenamientoException error = assertThrows(AlmacenamientoException.class,
                () -> servicio.subir(new byte[]{1}, "archivo.pdf", "application/pdf", "materias-1"));

        assertTrue(error.getMessage().contains("SUPABASE_URL"));
    }

    @Test
    void exigeLaClaveDeServicioAntesDeSubir() {
        SupabaseStorageService servicio = new SupabaseStorageService(
                "https://proyecto.supabase.co", " ", "materiales");

        AlmacenamientoException error = assertThrows(AlmacenamientoException.class,
                () -> servicio.subir(new byte[]{1}, "archivo.pdf", "application/pdf", "materias-1"));

        assertTrue(error.getMessage().contains("SUPABASE_SERVICE_ROLE_KEY"));
    }

    @Test
    void validaElNombreDelBucket() {
        SupabaseStorageService servicio = new SupabaseStorageService(
                "https://proyecto.supabase.co", "clave", "Bucket Inválido");

        AlmacenamientoException error = assertThrows(AlmacenamientoException.class,
                () -> servicio.subir(new byte[]{1}, "archivo.pdf", "application/pdf", "materias-1"));

        assertTrue(error.getMessage().contains("bucket"));
    }

    @Test
    void exigeLaConfiguracionAntesDeDescargar() {
        SupabaseStorageService sinUrl = new SupabaseStorageService("", "clave", "MaterialsTaller");
        AlmacenamientoException errorUrl = assertThrows(AlmacenamientoException.class,
                () -> sinUrl.descargar("materias-3/apunte.pdf"));
        assertTrue(errorUrl.getMessage().contains("SUPABASE_URL"));

        SupabaseStorageService sinClave = new SupabaseStorageService(
                "https://proyecto.supabase.co", " ", "MaterialsTaller");
        AlmacenamientoException errorClave = assertThrows(AlmacenamientoException.class,
                () -> sinClave.descargar("materias-3/apunte.pdf"));
        assertTrue(errorClave.getMessage().contains("SUPABASE_SERVICE_ROLE_KEY"));
    }

    @Test
    void rechazaRutaVaciaAlDescargar() {
        SupabaseStorageService servicio = new SupabaseStorageService(
                "https://proyecto.supabase.co", "clave", "MaterialsTaller");

        AlmacenamientoException error = assertThrows(AlmacenamientoException.class,
                () -> servicio.descargar("  "));

        assertTrue(error.getMessage().contains("ruta"));
    }
}
