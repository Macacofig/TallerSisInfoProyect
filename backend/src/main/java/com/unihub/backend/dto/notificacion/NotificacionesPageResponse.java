package com.unihub.backend.dto.notificacion;

import java.util.List;

public record NotificacionesPageResponse(List<NotificacionResponse> content, int page, int size,
                                        long totalElements, boolean hasMore) {}
