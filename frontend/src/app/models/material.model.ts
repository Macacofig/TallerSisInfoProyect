export interface MaterialResponse {
  id: number;
  linkMaterial: string;
  titulo: string;
  descripcion: string;
  tipo: 'IMAGEN' | 'WORD' | 'PDF' | 'POWERPOINT';
  idMateria: number;
  nombreMateria: string;
  idDocente: number;
  nombreDocente: string;
  semestreIngresado: number | null;
  estado: string;
}
