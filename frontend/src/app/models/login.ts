export interface LoginRequest {
  correoElectronico: string;
  contrasena: string;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  carrera: string;
}