export type TipoNotificacion = 'POSTULACION_CREADA' | 'POSTULACION_APROBADA'
  | 'POSTULACION_RECHAZADA' | 'SOLICITUD_AYUDA_RECIBIDA';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion | (string & {});
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  referenciaTipo: string | null;
  referenciaId: number | null;
}

export interface NotificacionesPage {
  content: Notificacion[];
  page: number;
  size: number;
  totalElements: number;
  hasMore: boolean;
}

export interface NotificacionesCount { count: number; }
