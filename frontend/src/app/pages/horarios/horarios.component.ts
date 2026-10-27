import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { MateriaHorario, OpcionHorario } from '../../data/horarios.data';
import { LanguageService } from '../../services/language.service';
import { HorariosService } from '../../services/horarios.service';
import {
  HorarioFiltroRequest,
  HorarioGeneracionRequest,
  HorarioMateriaRequest,
  HorarioNormalizacionResponse,
  HorarioResponse2
} from '../../models/horario';
import { APP_CONFIG } from '../../config/app-config';
import { HORARIOS_MESSAGES } from '../../strings/horarios/horarios.messages';
import { HORARIOS_MESSAGES as HORARIOS_MESSAGES_EN } from '../../strings/horarios/horarios-ingles.messages';
import { MESSAGES } from '../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../strings/materias/materias-ingles.messages';
import { presentarNombreMateriaPorCodigo } from '../../utils/text.utils';

interface BloqueFormulario {
  dia: number;
  horaInicio: string;
  horaFin: string;
}

interface MateriaFormulario {
  sigla: string;
  nombre: string;
  paralelo: number;
  docente: string;
  bloques: BloqueFormulario[];
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent {

  private readonly languageService = inject(LanguageService);
  private readonly horariosService = inject(HorariosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private static readonly PALETA_COLORES = [
    '#0b3c8c',
    '#2e7d5b',
    '#e3a82b',
    '#7957a8',
    '#b03a48',
    '#2b7a9e',
    '#8a5a2b',
    '#4f5d73'
  ];

  private static readonly TIEMPO_ESPERA = APP_CONFIG.TIMEOUTS.API_REQUEST;

  get textos() {
    return this.languageService.getMessages(HORARIOS_MESSAGES, HORARIOS_MESSAGES_EN);
  }

  get dias(): readonly string[] {
    return this.textos.DAYS;
  }

  get opcionesDia(): { valor: number; nombre: string }[] {
    return this.dias.map((nombre, indice) => ({
      valor: indice + 1,
      nombre
    }));
  }

  obtenerHorarioVisible(horario: string): string {
    return HORARIOS_MESSAGES.DAYS.reduce(
      (horarioTraducido, dia, indice) =>
        horarioTraducido.replaceAll(dia, this.dias[indice]),
      horario
    );
  }

  nombreMateriaVisible(materia: MateriaHorario): string {
    return presentarNombreMateriaPorCodigo(
      materia.codigo,
      materia.nombre,
      this.languageService.getMessages(MESSAGES, MESSAGES_EN).SUBJECT_NAMES
    );
  }

  readonly materias: MateriaHorario[] = [];

  materiasCrudas: HorarioMateriaRequest[] = [];

  modalAgregarAbierto = false;

  modalDescargarAbierto = false;

  formulario: MateriaFormulario = this.crearFormularioVacio();

  errorFormulario = '';

  private readonly materiasExpandidas = new Set<string>();

  materiasSeleccionadas: MateriaHorario[] = [];

  horas = [
    '07:15',
    '08:00',
    '08:45',
    '09:30',
    '10:15',
    '11:00',
    '11:45',
    '12:30',
    '13:15',
    '14:00',
    '14:45',
    '15:30',
    '16:15',
    '17:00',
    '17:45',
    '18:30',
    '19:15',
    '20:00',
    '20:45'
  ];

  paginaActual = 1;

  readonly alturaFila = 72;
  paginaMaterias = 1;
  readonly materiasPorPagina = 4;

  cantidadMin = 4;
  cantidadMax = 6;
  evitarHuecos = false;

  sessionId = '';

  soluciones: HorarioResponse2[] = [];
  solucionSeleccionadaIndex = 0;
  generandoHorarios = false;
  errorGeneracion = '';


  constructor() {
    this.render();
  }

  /* =========================
     CARGA DESDE EL BACKEND
     ========================= */

  cargarDatos(): void {
    const solicitud = this.materiasCrudas.map(materia => ({
      ...materia,
      horarios: (materia.horarios ?? []).map(bloque => ({ ...bloque }))
    }));

    if (solicitud.length === 0) {
      this.materias.splice(0, this.materias.length);
      this.materiasSeleccionadas = [];
      this.paginaMaterias = 1;
      this.render();
      this.changeDetector.markForCheck();
      return;
    }

    const orden = this.ordenMaterias(solicitud);

    this.horariosService.obtenerDatos(solicitud).pipe(
      timeout(HorariosComponent.TIEMPO_ESPERA),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: respuesta => this.aplicarRespuesta(respuesta, orden),
      error: () => this.changeDetector.markForCheck()
    });
  }

  private ordenMaterias(
    solicitud: HorarioMateriaRequest[]
  ): { codigo: string; nombre: string }[] {
    const vistos = new Set<string>();
    const orden: { codigo: string; nombre: string }[] = [];

    for (const materia of solicitud) {
      const codigo = (materia.siglaMateria ?? '').trim();

      if (!codigo || vistos.has(this.normalizarTexto(codigo))) {
        continue;
      }

      vistos.add(this.normalizarTexto(codigo));
      orden.push({ codigo, nombre: materia.nombreMateria });
    }

    return orden;
  }

  private aplicarRespuesta(
    respuesta: HorarioNormalizacionResponse,
    orden: { codigo: string; nombre: string }[]
  ): void {
    if (respuesta?.sessionId) {
      this.sessionId = respuesta.sessionId;
    }
    const porId = new Map<number, { codigo: string; nombre: string }>();
    orden.forEach((materia, indice) => porId.set(indice + 1, materia));

    const porNombre = new Map<string, { codigo: string; nombre: string }>();
    for (const materia of orden) {
      const clave = this.normalizarTexto(materia.nombre);

      if (!porNombre.has(clave)) {
        porNombre.set(clave, materia);
      }
    }

    const seleccionPrevia = new Map(
      this.materias.map(materia => [materia.codigo, materia.seleccionada])
    );

    const filtroPrevia = new Map(
      this.materias.map(materia => [materia.codigo, materia.estadoFiltro])
    );

    const docentePrevia = new Map(
      this.materias.flatMap(materia =>
        materia.opciones.map(
          oferta => [`${materia.codigo}|${oferta.idDocente}`, oferta.obligatorio] as const
        )
      )
    );

    const actualizaciones = new Map<string, MateriaHorario>();

    for (const materiaRespuesta of respuesta.materias ?? []) {
      const nombreRespuesta = this.normalizarTexto(
        materiaRespuesta.NombreMateria
      );

      let fuente = porId.get(materiaRespuesta.idMateria);

      if (
        fuente &&
        this.normalizarTexto(fuente.nombre) !== nombreRespuesta
      ) {
        fuente = porNombre.get(nombreRespuesta);
      }

      fuente = fuente ?? porNombre.get(nombreRespuesta);

      const codigo = fuente?.codigo ?? `MAT-${materiaRespuesta.idMateria}`;

      const opciones: OpcionHorario[] = (
        materiaRespuesta.Ofertas ?? []
      ).map(oferta => ({
        idDocente: oferta.idDocente,
        docente: (oferta.Docente ?? '').trim(),
        paralelo: oferta.Paralelo,
        horario: (oferta.Horarios ?? [])
          .map(
            bloque =>
              `${bloque.Dia} ${this.compactarHoras(bloque.Horas)}`
          )
          .join(' · '),
        obligatorio:
          docentePrevia.get(`${codigo}|${oferta.idDocente}`) ?? false
      }));

      actualizaciones.set(codigo, {
        codigo,
        nombre: materiaRespuesta.NombreMateria,
        seleccionada: seleccionPrevia.get(codigo) ?? true,
        idMateria: materiaRespuesta.idMateria,
        estadoFiltro: filtroPrevia.get(codigo) ?? 'normal',
        opciones
      });
    }

    const resultado: MateriaHorario[] = [];
    const agregados = new Set<string>();

    for (const fuente of orden) {
      resultado.push(actualizaciones.get(fuente.codigo) ?? {
        codigo: fuente.codigo,
        nombre: fuente.nombre,
        seleccionada: seleccionPrevia.get(fuente.codigo) ?? true,
        idMateria: 0,
        estadoFiltro: filtroPrevia.get(fuente.codigo) ?? 'normal',
        opciones: []
      });
      agregados.add(fuente.codigo);
    }

    for (const [codigo, materia] of actualizaciones) {
      if (!agregados.has(codigo)) {
        resultado.push(materia);
        agregados.add(codigo);
      }
    }

    for (const materia of this.materias) {
      if (agregados.has(materia.codigo)) {
        continue;
      }

      resultado.push(materia);
      agregados.add(materia.codigo);
    }

    this.materias.splice(0, this.materias.length, ...resultado);
    this.materiasSeleccionadas = this.materias.filter(
      materia => materia.seleccionada
    );
    this.paginaMaterias = Math.max(
      1,
      Math.min(this.paginaMaterias, this.totalPaginasMaterias)
    );

    this.render();
    this.changeDetector.markForCheck();
  }

  private compactarHoras(horas: string): string {
    return (horas ?? '').replace(/\s*-\s*/g, '-');
  }

  private normalizarTexto(valor: string): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* =========================
     PAGINACIÓN DINÁMICA
     ========================= */

  get totalHorarios(): number {
    if (this.materiasSeleccionadas.length === 0) {
      return 0;
    }

    return Math.max(
      0,
      ...this.materiasSeleccionadas.map(
        materia => materia.opciones?.length ?? 0
      )
    );
  }

  get hayHorarios(): boolean {
    return this.totalHorarios > 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalHorarios;
  }

  anterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  siguiente(): void {
    if (this.paginaActual < this.totalHorarios) {
      this.paginaActual++;
    }
  }

  render(): void {
    if (this.totalHorarios === 0) {
      this.paginaActual = 1;
      return;
    }

    if (this.paginaActual > this.totalHorarios) {
      this.paginaActual = this.totalHorarios;
    }

    if (this.paginaActual < 1) {
      this.paginaActual = 1;
    }
  }

  /* =========================
     SELECCIÓN DE MATERIAS
     ========================= */

  seleccionarMateria(materia: MateriaHorario): void {
    materia.seleccionada = !materia.seleccionada;

    if (materia.seleccionada) {
      const yaExiste = this.materiasSeleccionadas.some(
        m => m.codigo === materia.codigo
      );

      if (!yaExiste) {
        this.materiasSeleccionadas.push(materia);
      }
    } else {
      this.materiasSeleccionadas =
        this.materiasSeleccionadas.filter(
          m => m.codigo !== materia.codigo
        );
    }

    this.render();
  }

  /* =========================
     OPCIÓN SEGÚN LA PÁGINA
     ========================= */

  private obtenerHorarioPrincipal(
    materia: MateriaHorario
  ): string {
    const opciones = materia.opciones ?? [];
    const indice = this.paginaActual - 1;

    if (indice < 0 || indice >= opciones.length) {
      return '';
    }

    return opciones[indice].horario;
  }

  /* =========================
     EXPANSIÓN DE OFERTAS
     ========================= */

  estaExpandida(materia: MateriaHorario): boolean {
    return this.materiasExpandidas.has(materia.codigo);
  }

  alternarExpansion(materia: MateriaHorario): void {
    if (this.materiasExpandidas.has(materia.codigo)) {
      this.materiasExpandidas.delete(materia.codigo);
    } else {
      this.materiasExpandidas.add(materia.codigo);
    }
  }

  /* =========================
     FILTROS DE GENERACIÓN
     ========================= */

  alternarObligatoria(materia: MateriaHorario): void {
    materia.estadoFiltro =
      materia.estadoFiltro === 'obligatoria' ? 'normal' : 'obligatoria';
  }

  alternarExcluida(materia: MateriaHorario): void {
    materia.estadoFiltro =
      materia.estadoFiltro === 'excluida' ? 'normal' : 'excluida';
  }

  alternarDocenteObligatorio(oferta: OpcionHorario): void {
    oferta.obligatorio = !oferta.obligatorio;
  }

  construirFiltros(): HorarioFiltroRequest {
    const min = this.normalizarCantidad(this.cantidadMin, 1);
    const max = Math.max(min, this.normalizarCantidad(this.cantidadMax, min));

    const materiasObligatorias: number[] = [];
    const materiasExcluidas: number[] = [];
    const docentes = new Map<number, Set<number>>();

    for (const materia of this.materias) {
      if (materia.idMateria <= 0) {
        continue;
      }

      if (materia.estadoFiltro === 'excluida') {
        materiasExcluidas.push(materia.idMateria);
        continue;
      }

      if (materia.estadoFiltro === 'obligatoria') {
        materiasObligatorias.push(materia.idMateria);
      }

      for (const oferta of materia.opciones) {
        if (!oferta.obligatorio) {
          continue;
        }

        const materiasDelDocente =
          docentes.get(oferta.idDocente) ?? new Set<number>();

        materiasDelDocente.add(materia.idMateria);
        docentes.set(oferta.idDocente, materiasDelDocente);
      }
    }

    return {
      cantidadMaterias: { min, max },
      materiasObligatorias,
      materiasExcluidas,
      docentes: Object.fromEntries(
        [...docentes].map(([docente, materias]) => [docente, [...materias]])
      ),
      evitarHuecos: this.evitarHuecos
    };
  }

  generarHorarios(): void {
    if (this.generandoHorarios) {
      return;
    }

    if (!this.sessionId) {
      this.errorGeneracion = this.textos.GENERATE_ERROR ?? '';
      this.changeDetector.markForCheck();
      return;
    }

    this.generandoHorarios = true;
    this.errorGeneracion = '';

    const filtros = this.construirFiltros();
    const solicitud: HorarioGeneracionRequest = {
      sessionId: this.sessionId,
      filtros
    };

    this.horariosService
      .generarHorarios(solicitud)
      .pipe(
        timeout(HorariosComponent.TIEMPO_ESPERA),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: soluciones => {
          this.generandoHorarios = false;

          if (!soluciones || soluciones.length === 0) {
            this.soluciones = [];
            this.solucionSeleccionadaIndex = 0;
            this.materiasSeleccionadas = [];
            this.paginaActual = 1;
            this.sessionId = '';
            this.errorGeneracion = this.textos.NO_SOLUTIONS ?? '';
            this.render();
            this.changeDetector.markForCheck();
            this.refrescarSesionTrasGeneracionVacia();
            return;
          }

          const ordenadas = [...soluciones].sort((a, b) => {
            const puntuacionA = a.puntuacion ?? 0;
            const puntuacionB = b.puntuacion ?? 0;
            return puntuacionB - puntuacionA;
          });

          this.soluciones = ordenadas;
          this.solucionSeleccionadaIndex = 0;
          this.errorGeneracion = '';
          this.aplicarSolucionSeleccionada();
          this.render();
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.generandoHorarios = false;
          this.soluciones = [];
          this.solucionSeleccionadaIndex = 0;
          this.materiasSeleccionadas = [];
          this.errorGeneracion = this.textos.GENERATE_ERROR ?? '';
          this.sessionId = '';
          this.render();
          this.changeDetector.markForCheck();
          this.refrescarSesionTrasGeneracionVacia();
        }
      });
  }

  private refrescarSesionTrasGeneracionVacia(): void {
    if (this.materiasCrudas.length === 0) {
      return;
    }

    this.cargarDatos();
  }

  seleccionarSolucion(indice: number): void {
    if (indice < 0 || indice >= this.soluciones.length) {
      return;
    }

    this.solucionSeleccionadaIndex = indice;
    this.aplicarSolucionSeleccionada();
    this.paginaActual = 1;
    this.render();
    this.changeDetector.markForCheck();
  }

  private aplicarSolucionSeleccionada(): void {
    const solucion = this.soluciones[this.solucionSeleccionadaIndex];
    if (!solucion) {
      this.materiasSeleccionadas = [];
      return;
    }

    const materias: MateriaHorario[] = [];

    for (const horario of solucion.horarios ?? []) {
      const codigo = this.extraerCodigoMateria(horario.materia);
      const nombre = this.extraerNombreMateria(horario.materia);

      materias.push({
        codigo,
        nombre,
        seleccionada: true,
        idMateria: this.obtenerIdMateriaPorNombreOCodigo(nombre, codigo),
        estadoFiltro: 'normal',
        opciones: [
          {
            idDocente: this.obtenerIdDocentePorNombre(horario.docente),
            docente: horario.docente ?? '',
            paralelo: 0,
            horario: this.formatearHorarioGenerado(horario.horarios ?? []),
            obligatorio: false
          }
        ]
      });
    }

    this.materiasSeleccionadas = materias;
  }

  private extraerCodigoMateria(texto: string): string {
    if (!texto) {
      return '';
    }

    const coincidencia = texto.match(/^([A-Z]{2,4}-?\d{3,4})/i);
    if (coincidencia) {
      return coincidencia[1].toUpperCase();
    }

    return texto.trim();
  }

  private extraerNombreMateria(texto: string): string {
    if (!texto) {
      return '';
    }

    const codigo = this.extraerCodigoMateria(texto);
    if (codigo && texto.toUpperCase().includes(codigo)) {
      const restante = texto.replace(new RegExp(codigo, 'i'), '').trim();
      if (restante) {
        return restante.replace(/^[\-\s:]+|[\-\s:]+$/g, '').trim();
      }
    }

    return texto.trim();
  }

  private obtenerIdMateriaPorNombreOCodigo(nombre: string, codigo: string): number {
    const normalizadoCodigo = this.normalizarTexto(codigo);
    const normalizadoNombre = this.normalizarTexto(nombre);

    for (const materia of this.materias) {
      if (this.normalizarTexto(materia.codigo) === normalizadoCodigo && materia.idMateria > 0) {
        return materia.idMateria;
      }
      if (normalizadoNombre && this.normalizarTexto(materia.nombre) === normalizadoNombre && materia.idMateria > 0) {
        return materia.idMateria;
      }
    }

    for (let indice = 0; indice < this.materiasCrudas.length; indice++) {
      const cruda = this.materiasCrudas[indice];
      if (this.normalizarTexto(cruda.siglaMateria) === normalizadoCodigo) {
        const materia = this.materias[indice];
        if (materia?.idMateria) {
          return materia.idMateria;
        }
      }
      if (normalizadoNombre && this.normalizarTexto(cruda.nombreMateria) === normalizadoNombre) {
        const materia = this.materias[indice];
        if (materia?.idMateria) {
          return materia.idMateria;
        }
      }
    }

    return 0;
  }

  private obtenerIdDocentePorNombre(docente: string): number {
    if (!docente) {
      return 0;
    }

    const normalizado = this.normalizarTexto(docente);

    for (const materia of this.materias) {
      for (const oferta of materia.opciones) {
        if (this.normalizarTexto(oferta.docente) === normalizado) {
          return oferta.idDocente;
        }
      }
    }

    return 0;
  }

  private formatearHorarioGenerado(bloques: { dia: string; horaInicio: string; horaFin: string }[]): string {
    if (!bloques || bloques.length === 0) {
      return '';
    }

    return bloques
      .map(bloque => {
        const dia = bloque.dia ?? '';
        const inicio = bloque.horaInicio ?? '';
        const fin = bloque.horaFin ?? '';
        return `${dia} ${inicio}-${fin}`;
      })
      .join(' · ');
  }

  private normalizarCantidad(valor: number, minimo: number): number {
    const numero = Math.trunc(Number(valor));

    if (!Number.isFinite(numero)) {
      return minimo;
    }

    return Math.min(Math.max(numero, minimo), 99);
  }

  /* =========================
     BLOQUES DE MATERIA
     ========================= */

  obtenerBloquesMateria(
    materia: MateriaHorario,
    dia: string
  ): {
    inicio: string;
    fin: string;
  }[] {
    const horario = this.obtenerHorarioPrincipal(materia);

    if (!horario) {
      return [];
    }

    const bloques = horario.split('·');

    const resultado: {
      inicio: string;
      fin: string;
    }[] = [];

    for (const bloque of bloques) {
      const bloqueNormalizado = bloque.trim();

      const regex =
        /^(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/;

      const coincidencia = bloqueNormalizado.match(regex);

      if (!coincidencia) {
        continue;
      }

      const diaBloque = coincidencia[1].trim().toLowerCase();
      const indiceDia = this.dias.indexOf(dia);
      const diaCanonico = this.languageService.isEnglish()
        ? HORARIOS_MESSAGES.DAYS[indiceDia]?.toLowerCase()
        : dia.toLowerCase();

      if (diaBloque !== diaCanonico) {
        continue;
      }

      resultado.push({
        inicio: coincidencia[2],
        fin: coincidencia[3]
      });
    }

    return resultado;
  }

  /* =========================
     POSICIÓN DE LA TARJETA
     ========================= */

  obtenerPosicionMateria(horaInicio: string): number {
    const minutosInicio = this.convertirMinutos(horaInicio);

    const minutosPrimeraHora = this.convertirMinutos(
      this.horas[0]
    );

    const diferencia = minutosInicio - minutosPrimeraHora;

    return (diferencia / 45) * this.alturaFila;
  }

  /* =========================
     ALTURA DE LA TARJETA
     ========================= */

  obtenerAlturaMateria(
    horaInicio: string,
    horaFin: string
  ): number {
    const inicio = this.convertirMinutos(horaInicio);
    const fin = this.convertirMinutos(horaFin);

    const duracion = fin - inicio;
    const cantidadFilas = duracion / 45;
    const espacioVertical = 8;

    return Math.max(
      this.alturaFila * cantidadFilas - espacioVertical,
      30
    );
  }

  /* =========================
     COMPROBAR HORARIO
     ========================= */

  estaMateriaEnHorario(
    materia: MateriaHorario,
    dia: string,
    hora: string
  ): boolean {
    const bloques = this.obtenerBloquesMateria(materia, dia);
    const horaActual = this.convertirMinutos(hora);

    return bloques.some(bloque => {
      const inicio = this.convertirMinutos(bloque.inicio);
      const fin = this.convertirMinutos(bloque.fin);

      return horaActual >= inicio && horaActual < fin;
    });
  }

  /* =========================
     MOSTRAR TARJETA
     ========================= */

  mostrarMateriaEnCelda(
    materia: MateriaHorario,
    dia: string,
    hora: string
  ): boolean {
    const bloques = this.obtenerBloquesMateria(materia, dia);
    const horaActual = this.convertirMinutos(hora);

    return bloques.some(bloque => {
      const inicio = this.convertirMinutos(bloque.inicio);

      return horaActual === inicio;
    });
  }

  /* =========================
     CONVERSIÓN DE HORAS
     ========================= */

  private convertirMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);

    return horas * 60 + minutos;
  }

  /* =========================
     COLORES
     ========================= */

  obtenerColorMateria(codigo: string): string {
    const base = this.normalizarTexto(codigo);
    let hash = 0;

    for (let indice = 0; indice < base.length; indice++) {
      hash = (hash * 31 + base.charCodeAt(indice)) >>> 0;
    }

    const paleta = HorariosComponent.PALETA_COLORES;

    return paleta[hash % paleta.length];
  }

  /* =========================
     FORMULARIO DE MATERIAS
     ========================= */

  private crearFormularioVacio(): MateriaFormulario {
    return {
      sigla: '',
      nombre: '',
      paralelo: 1,
      docente: '',
      bloques: [this.crearBloqueVacio()]
    };
  }

  private crearBloqueVacio(): BloqueFormulario {
    return { dia: 1, horaInicio: '', horaFin: '' };
  }

  get formularioValido(): boolean {
    const formulario = this.formulario;

    return (
      formulario.sigla.trim() !== '' &&
      formulario.nombre.trim() !== '' &&
      formulario.docente.trim() !== '' &&
      formulario.bloques.length > 0 &&
      formulario.bloques.every(
        bloque =>
          bloque.horaInicio !== '' &&
          bloque.horaFin !== '' &&
          bloque.horaInicio < bloque.horaFin
      )
    );
  }

  abrirModalAgregar(): void {
    this.modalAgregarAbierto = true;
    this.formulario = this.crearFormularioVacio();
    this.errorFormulario = '';
  }

  cerrarModalAgregar(): void {
    this.modalAgregarAbierto = false;
  }

  agregarBloque(): void {
    this.formulario.bloques.push(this.crearBloqueVacio());
  }

  quitarBloque(indice: number): void {
    this.formulario.bloques.splice(indice, 1);

    if (this.formulario.bloques.length === 0) {
      this.formulario.bloques.push(this.crearBloqueVacio());
    }
  }

  agregarMateria(): void {
    if (!this.formularioValido) {
      return;
    }

    const formulario = this.formulario;
    const paralelo = Number(formulario.paralelo) || 1;
    const docente = formulario.docente.trim();

    if (this.esDuplicada(formulario.sigla, docente, paralelo)) {
      this.errorFormulario = this.textos.DUPLICATE_SUBJECT;
      return;
    }

    this.materiasCrudas.push({
      siglaMateria: formulario.sigla.trim(),
      paralelo: paralelo,
      nombreMateria: formulario.nombre.trim(),
      horarios: formulario.bloques.map(bloque => ({
        docenteNombre: docente,
        dia: Number(bloque.dia) || 1,
        horas: `${bloque.horaInicio} - ${bloque.horaFin}`
      }))
    });

    this.formulario = this.crearFormularioVacio();
    this.errorFormulario = '';
  }

  reutilizarMateria(indice: number): void {
    const materia = this.materiasCrudas[indice];

    if (!materia) {
      return;
    }

    this.formulario = {
      sigla: materia.siglaMateria,
      nombre: materia.nombreMateria,
      paralelo: materia.paralelo,
      docente: this.docenteDeMateria(materia),
      bloques: [this.crearBloqueVacio()]
    };

    this.errorFormulario = '';
  }

  private esDuplicada(
    sigla: string,
    docente: string,
    paralelo: number
  ): boolean {
    const clave = this.claveDuplicado(sigla, docente, paralelo);

    return this.materiasCrudas.some(
      materia =>
        this.claveDuplicado(
          materia.siglaMateria,
          this.docenteDeMateria(materia),
          materia.paralelo
        ) === clave
    );
  }

  private claveDuplicado(
    sigla: string,
    docente: string,
    paralelo: number
  ): string {
    return [
      this.normalizarTexto(sigla),
      this.normalizarTexto(docente),
      paralelo
    ].join('|');
  }

  quitarMateriaCruda(indice: number): void {
    this.materiasCrudas.splice(indice, 1);
  }

  docenteDeMateria(materia: HorarioMateriaRequest): string {
    return materia.horarios?.[0]?.docenteNombre ?? '';
  }

  horarioDeMateria(materia: HorarioMateriaRequest): string {
    return (materia.horarios ?? [])
      .map(
        bloque =>
          `${this.nombreDia(bloque.dia)} ${this.compactarHoras(bloque.horas)}`
      )
      .join(' · ');
  }

  private nombreDia(dia: number): string {
    return this.dias[dia - 1] ?? String(dia);
  }

  enviarMaterias(): void {
    this.cerrarModalAgregar();
    this.cargarDatos();
  }

  // Abrir la vista previa del horario
  abrirModalDescargar(): void {
    this.modalDescargarAbierto = true;
  }

  // Cerrar la vista previa del horario
  cerrarModalDescargar(): void {
    this.modalDescargarAbierto = false;
  }


  // Materias que se muestran en la página actual
  get materiasPaginadas(): MateriaHorario[] {
    const inicio = (this.paginaMaterias - 1) * this.materiasPorPagina;

    return this.materias.slice(
      inicio,
      inicio + this.materiasPorPagina
    );
  }

  // Cantidad total de páginas de materias
  get totalPaginasMaterias(): number {
    return Math.max(
      1,
      Math.ceil(this.materias.length / this.materiasPorPagina)
    );
  }

  // Ir a la página anterior de materias
  anteriorMaterias(): void {
    if (this.paginaMaterias > 1) {
      this.paginaMaterias--;
    }
  }

  // Ir a la página siguiente de materias
  siguienteMaterias(): void {
    if (this.paginaMaterias < this.totalPaginasMaterias) {
      this.paginaMaterias++;
    }
  }

}