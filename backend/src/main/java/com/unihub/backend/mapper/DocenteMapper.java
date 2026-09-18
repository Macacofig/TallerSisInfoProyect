package com.unihub.backend.mapper;

import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.entity.Docente;
import org.springframework.stereotype.Component;

@Component
public class DocenteMapper {

	public DocenteResponse toResponse(Docente docente) {
		return new DocenteResponse(
				docente.getId(),
				docente.getNombre(),
				docente.getMateria().getId()
		);
	}
}
