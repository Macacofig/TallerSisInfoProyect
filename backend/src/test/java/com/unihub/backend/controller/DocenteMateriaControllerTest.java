package com.unihub.backend.controller;

import com.unihub.backend.dto.docente.DocenteMateriaResponse;
import com.unihub.backend.exception.AccesoNoAutorizadoException;
import com.unihub.backend.service.CatalogAdminAuthorization;
import com.unihub.backend.service.DocenteMateriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocenteMateriaController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class DocenteMateriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocenteMateriaService docenteMateriaService;

    @MockitoBean
    private CatalogAdminAuthorization catalogAdminAuthorization;

    @Test
    void permiteCrearLaRelacionConElTokenAdministrativo() throws Exception {
        when(docenteMateriaService.crear(any())).thenReturn(new DocenteMateriaResponse(1L, 2L, 3L));

        mockMvc.perform(post("/api/docente-materia")
                        .header("X-Catalog-Admin-Token", "admin-test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idDocente\":2,\"idMateria\":3}"))
                .andExpect(status().isCreated());

        verify(catalogAdminAuthorization).requerirAdministrador("admin-test-token");
        verify(docenteMateriaService).crear(any());
    }

    @Test
    void rechazaCrearLaRelacionSinTokenAdministrativo() throws Exception {
        doThrow(new AccesoNoAutorizadoException()).when(catalogAdminAuthorization)
                .requerirAdministrador(null);

        mockMvc.perform(post("/api/docente-materia")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idDocente\":2,\"idMateria\":3}"))
                .andExpect(status().isForbidden());

        verify(docenteMateriaService, never()).crear(any());
    }
}
