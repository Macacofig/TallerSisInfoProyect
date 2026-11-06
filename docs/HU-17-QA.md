# HU-17 - Guia de verificacion para QA

## Alcance
Gestion de postulaciones de ayudantes desde una cuenta ADMIN.

## Requisitos
- Docker y Docker Compose.
- PostgreSQL de pruebas independiente.
- Variables de entorno requeridas por docker-compose.yml.
- No utilizar una base de datos de produccion.

## Configuracion
1. Descargar la rama alda/HU-17.
2. Preparar el archivo .env local con las variables de conexion.
3. Configurar JWT_SECRET con un secreto seguro.
4. Verificar que PostgreSQL sea una base de pruebas.
5. Verificar que la conexion configurada admita SSL, como exige
   el docker-compose.yml actual.

## Administrador de pruebas
El backend dispone de aprovisionamiento ADMIN opcional.

Variables:
- UNIHUB_ADMIN_PROVISION_ENABLED=true
- ADMIN_PROVISION_EMAIL=usuarioadmin@ucb.edu.bo
- ADMIN_PROVISION_PASSWORD=<clave temporal segura>
- ADMIN_PROVISION_NAME=<nombre de prueba>
- ADMIN_PROVISION_PHONE=<telefono de prueba valido>
- ADMIN_PROVISION_CAREER=<carrera>

La clave debe tener al menos 12 caracteres.
El correo no debe existir previamente en la base seleccionada.

Habilitar el aprovisionamiento solo durante la creacion
inicial de la cuenta en una base descartable.

Deshabilitarlo despues:
UNIHUB_ADMIN_PROVISION_ENABLED=false

Nunca compartir ni versionar contrasenas o archivos .env.

## Ejecucion
docker compose config --quiet
docker compose up --build -d

Frontend:
http://localhost:4200

Backend:
http://localhost:8081

Ruta administrativa:
/administracion/solicitudes-ayudante

## Escenarios para QA
1. Iniciar sesion con el usuario ADMIN.
2. Verificar acceso al panel administrativo.
3. Consultar postulaciones pendientes.
4. Aprobar una postulacion.
5. Rechazar otra postulacion.
6. Comprobar que los estados se actualicen correctamente.
7. Verificar que un estudiante normal no acceda al panel.
8. Verificar HTTP 403 al intentar postular por otro estudiante.
9. Verificar HTTP 409 al repetir una postulacion activa.
10. Revisar la visualizacion del panel y sus botones.

## Advertencias
- No ejecutar scripts/schema.sql en una base con datos importantes:
  contiene instrucciones DROP TABLE.
- El Docker Compose actual requiere PostgreSQL configurado externamente.
- El entorno local utiliza localhost:8081 para las peticiones API.
- Verificar que el backend este conectado a la base de pruebas esperada.
- No utilizar credenciales reales en capturas ni reportes.

## Pruebas automatizadas
Backend:
cd backend
.\mvnw.cmd test

Frontend:
cd frontend
npm test -- --watch=false
npm run build

## Entrega
El desarrollador actualiza el PR existente de alda/HU-17.
QA verifica y decide Approve o Request changes.
No realizar merge a main durante la revision.