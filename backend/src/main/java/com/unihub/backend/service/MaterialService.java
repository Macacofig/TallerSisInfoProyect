package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.material.MaterialDescarga;
import com.unihub.backend.dto.material.MaterialRequest;
import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudMaterial;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.MaterialMapper;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MaterialRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudMaterialRepository;
import com.unihub.backend.service.almacenamiento.AlmacenamientoArchivos;
import com.unihub.backend.service.almacenamiento.ArchivoAlmacenado;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class MaterialService {

    private static final Set<String> EXTENSIONES_IMAGEN =
            Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp");
    private static final Set<String> EXTENSIONES_WORD = Set.of("doc", "docx");
    private static final Set<String> EXTENSIONES_PDF = Set.of("pdf");
    private static final Set<String> EXTENSIONES_POWERPOINT = Set.of("ppt", "pptx");

    private static final Map<String, String> MIME_POR_EXTENSION = Map.ofEntries(
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"),
            Map.entry("gif", "image/gif"),
            Map.entry("webp", "image/webp"),
            Map.entry("bmp", "image/bmp"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("pdf", "application/pdf"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation")
    );

    private final MaterialRepository materialRepository;
    private final SolicitudMaterialRepository solicitudMaterialRepository;
    private final MateriaRepository materiaRepository;
    private final DocenteRepository docenteRepository;
    private final DocenteMateriaRepository docenteMateriaRepository;
    private final EstudianteRepository estudianteRepository;
    private final AlmacenamientoArchivos almacenamiento;
    private final MaterialMapper materialMapper;
    private final ActividadEstudianteService actividadService;
    private final long tamanioMaximoBytes;

    public MaterialService(
            MaterialRepository materialRepository,
            SolicitudMaterialRepository solicitudMaterialRepository,
            MateriaRepository materiaRepository,
            DocenteRepository docenteRepository,
            DocenteMateriaRepository docenteMateriaRepository,
            EstudianteRepository estudianteRepository,
            AlmacenamientoArchivos almacenamiento,
            MaterialMapper materialMapper,
            ActividadEstudianteService actividadService,
            @Value("${app.materiales.max-file-size-bytes:20971520}") long tamanioMaximoBytes
    ) {
        this.materialRepository = materialRepository;
        this.solicitudMaterialRepository = solicitudMaterialRepository;
        this.materiaRepository = materiaRepository;
        this.docenteRepository = docenteRepository;
        this.docenteMateriaRepository = docenteMateriaRepository;
        this.estudianteRepository = estudianteRepository;
        this.almacenamiento = almacenamiento;
        this.materialMapper = materialMapper;
        this.actividadService = actividadService;
        this.tamanioMaximoBytes = tamanioMaximoBytes;
    }

    /**
     * Sube el archivo a Supabase Storage y registra el material junto con su
     * solicitud de aprobación en estado PENDIENTE.
     */
    @Transactional
    public MaterialSubidoResponse subirMaterialAcademico(
            MaterialRequest request,
            MultipartFile documento,
            Long estudianteId
    ) {
        validarSolicitud(request);
        DocumentoValidado archivo = validarDocumento(documento);

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("El estudiante no existe"));
        Materia materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new ResourceNotFoundException("La materia no existe"));
        Docente docente = docenteRepository.findById(request.idDocente())
                .orElseThrow(() -> new ResourceNotFoundException("El docente no existe"));

        if (!docenteMateriaRepository.existsByDocenteIdAndMateriaId(docente.getId(), materia.getId())) {
            throw new BadRequestException("El docente seleccionado no imparte la materia indicada");
        }

        Integer semestre = request.semestreIngresado() != null
                ? request.semestreIngresado()
                : materia.getSemestre();

        if (semestre != null && (semestre < 1 || semestre > 20)) {
            throw new BadRequestException("El semestre ingresado debe estar entre 1 y 20");
        }

        String carpeta = "materias-" + materia.getId();
        ArchivoAlmacenado archivoSubido = almacenamiento.subir(
                archivo.contenido(),
                archivo.nombre(),
                archivo.contentType(),
                carpeta
        );

        try {
            Material material = new Material(
                    archivoSubido.url(),
                    request.titulo().trim(),
                    request.descripcion().trim(),
                    archivo.tipo(),
                    materia,
                    docente,
                    semestre
            );
            material = materialRepository.save(material);

            SolicitudMaterial solicitud = solicitudMaterialRepository.save(
                    new SolicitudMaterial(material.getTitulo(), estudiante, material)
            );

            LogHelper.info(MaterialService.class,
                    "Material " + material.getId() + " subido por el estudiante " + estudianteId
                            + " para la materia " + materia.getId());

            actividadService.registrarMaterial(estudiante, material);
            return new MaterialSubidoResponse(
                    materialMapper.toResponse(material),
                    materialMapper.toSolicitudResponse(solicitud)
            );
        } catch (RuntimeException exception) {
            almacenamiento.eliminar(archivoSubido.ruta());
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public MaterialDescarga descargar(Long idMaterial) {
        if (idMaterial == null || idMaterial <= 0) {
            throw new BadRequestException("El material es obligatorio");
        }

        Material material = materialRepository.findById(idMaterial)
                .orElseThrow(() -> new ResourceNotFoundException("El material no existe"));

        String link = material.getLinkMaterial();
        String ruta = extraerRuta(link);
        String nombreArchivo = extraerNombreArchivo(link);

        return new MaterialDescarga(almacenamiento.descargar(ruta), nombreArchivo);
    }

    private String extraerRuta(String link) {
        String marcador = "/storage/v1/object/public/";
        if (link == null) {
            throw new BadRequestException("El material no tiene una URL de descarga válida");
        }

        int inicio = link.indexOf(marcador);
        if (inicio < 0) {
            throw new BadRequestException("El material no tiene una URL de descarga válida");
        }

        String resto = link.substring(inicio + marcador.length()).split("[?#]", 2)[0];
        int barra = resto.indexOf('/');
        if (barra < 0 || barra == resto.length() - 1) {
            throw new BadRequestException("El material no tiene una URL de descarga válida");
        }

        return resto.substring(barra + 1);
    }

    private String extraerNombreArchivo(String link) {
        String ultimoSegmento = link.substring(link.lastIndexOf('/') + 1).split("[?#]", 2)[0];
        String nombre = ultimoSegmento.replaceFirst(
                "^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}-", "");
        return nombre.isBlank() ? "material" : nombre;
    }

    /**
     * Devuelve los materiales aprobados (estado ACTIVO) ordenados por título.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponse> obtenerAprobados() {
        return materialRepository.findByEstadoOrderByTituloAsc(Material.EstadoMaterial.ACTIVO).stream()
                .map(materialMapper::toResponse)
                .toList();
    }

    /**
     * Devuelve los materiales de una materia con los nombres de la materia y
     * del docente, además del enlace público para descargar el archivo.
     * Los filtros por docente, semestre y tipo son opcionales.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponse> obtenerPorMateria(
            Long materiaId,
            Long idDocente,
            Integer semestre,
            String tipo
    ) {
        if (materiaId == null || materiaId <= 0) {
            throw new BadRequestException("La materia es obligatoria");
        }
        if (idDocente != null && idDocente <= 0) {
            throw new BadRequestException("El docente no es válido");
        }
        if (semestre != null && (semestre < 1 || semestre > 20)) {
            throw new BadRequestException("El semestre debe estar entre 1 y 20");
        }

        Material.TipoMaterial tipoMaterial = parsearTipo(tipo);

        if (!materiaRepository.existsById(materiaId)) {
            throw new ResourceNotFoundException("La materia no existe");
        }

        return materialRepository.findByMateriaIdOrderByTituloAsc(materiaId).stream()
                .filter(material -> idDocente == null || idDocente.equals(material.getDocente().getId()))
                .filter(material -> semestre == null || semestre.equals(material.getSemestreIngresado()))
                .filter(material -> tipoMaterial == null || tipoMaterial == material.getTipo())
                .map(materialMapper::toResponse)
                .toList();
    }

    private Material.TipoMaterial parsearTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return null;
        }

        try {
            return Material.TipoMaterial.valueOf(tipo.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Tipo de material no válido. Use IMAGEN, WORD, PDF o POWERPOINT");
        }
    }

    private void validarSolicitud(MaterialRequest request) {
        if (request == null) {
            throw new BadRequestException("La solicitud de material es obligatoria");
        }
        if (request.titulo() == null || request.titulo().isBlank()) {
            throw new BadRequestException("El título del material es obligatorio");
        }
        if (request.descripcion() == null || request.descripcion().isBlank()) {
            throw new BadRequestException("La descripción del material es obligatoria");
        }
        if (request.idMateria() == null || request.idMateria() <= 0) {
            throw new BadRequestException("La materia es obligatoria");
        }
        if (request.idDocente() == null || request.idDocente() <= 0) {
            throw new BadRequestException("El docente es obligatorio");
        }
    }

    private DocumentoValidado validarDocumento(MultipartFile documento) {
        if (documento == null || documento.isEmpty()) {
            throw new BadRequestException("El documento es obligatorio");
        }

        if (documento.getSize() > tamanioMaximoBytes) {
            throw new BadRequestException(
                    "El archivo supera el tamaño máximo permitido de "
                            + (tamanioMaximoBytes / (1024 * 1024)) + " MB");
        }

        String nombre = documento.getOriginalFilename() == null || documento.getOriginalFilename().isBlank()
                ? "archivo"
                : documento.getOriginalFilename();
        String extension = obtenerExtension(nombre);
        Material.TipoMaterial tipo = tipoPorExtension(extension);

        if (tipo == null) {
            tipo = tipoPorContentType(documento.getContentType());
        }

        if (tipo == null) {
            throw new BadRequestException(
                    "Formato no permitido. Solo se aceptan imágenes, archivos PDF, Word y PowerPoint");
        }

        String contentType = MIME_POR_EXTENSION.get(extension);

        if (contentType == null) {
            contentType = documento.getContentType();
        }

        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        try {
            return new DocumentoValidado(documento.getBytes(), nombre, contentType, tipo);
        } catch (IOException exception) {
            throw new BadRequestException("No se pudo leer el archivo adjunto");
        }
    }

    private String obtenerExtension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        if (punto < 0 || punto == nombre.length() - 1) {
            return "";
        }
        return nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
    }

    private Material.TipoMaterial tipoPorExtension(String extension) {
        if (EXTENSIONES_IMAGEN.contains(extension)) {
            return Material.TipoMaterial.IMAGEN;
        }
        if (EXTENSIONES_WORD.contains(extension)) {
            return Material.TipoMaterial.WORD;
        }
        if (EXTENSIONES_PDF.contains(extension)) {
            return Material.TipoMaterial.PDF;
        }
        if (EXTENSIONES_POWERPOINT.contains(extension)) {
            return Material.TipoMaterial.POWERPOINT;
        }
        return null;
    }

    private Material.TipoMaterial tipoPorContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return null;
        }

        String tipo = contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();

        if (tipo.startsWith("image/")) {
            return Material.TipoMaterial.IMAGEN;
        }
        if ("application/pdf".equals(tipo)) {
            return Material.TipoMaterial.PDF;
        }
        if (tipo.contains("word") || "application/msword".equals(tipo)) {
            return Material.TipoMaterial.WORD;
        }
        if (tipo.contains("presentation") || tipo.contains("powerpoint")) {
            return Material.TipoMaterial.POWERPOINT;
        }
        return null;
    }

    private record DocumentoValidado(
            byte[] contenido,
            String nombre,
            String contentType,
            Material.TipoMaterial tipo
    ) {
    }
}
