package com.unihub.backend.dto.material;

public record MaterialSubidoResponse(
        MaterialResponse material,
        SolicitudMaterialResponse solicitud
) {
}
