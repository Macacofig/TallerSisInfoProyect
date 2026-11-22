export interface MaterialPendienteDocumento {
  archivo: string;
  materia: string;
  docente: string;
  semestre: string;
  usuario: string;
  tipo: string;
  fecha: string;
}

export const MATERIAL_PENDIENTE_DOCUMENTOS_MOCK: MaterialPendienteDocumento[] = [
  {
    archivo: 'Tarea 3 — modelado de procesos',
    materia: 'Investigación Operativa',
    docente: 'Carlos Mendoza',
    semestre: '2026-1',
    usuario: 'hugo.paz',
    tipo: 'Tarea',
    fecha: '2026-04-08'
  },
  {
    archivo: 'Segundo parcial 2025-2',
    materia: 'Contabilidad General',
    docente: 'Marcela Rojas',
    semestre: '2025-2',
    usuario: 'nadia.lopez',
    tipo: 'Examen',
    fecha: '2026-04-19'
  }
];
