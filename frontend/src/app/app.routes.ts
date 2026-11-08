import { Routes } from '@angular/router';

import { SplashComponent } from './pages/splash/splash.component';
import { HomeComponent } from './pages/home/home.component';
import { MateriasComponent } from './pages/materias/listado/materias.component';
import { MateriaDetalleComponent } from './pages/materias/detail/materia-detalle.component';

import { Registro } from './pages/registro/registro';
import { Login } from './pages/login/login';
import { RecuperarContrasena } from './pages/recuperar-contrasena/recuperar-contrasena';
import { Perfil } from './pages/perfil/perfil';
import { HorariosComponent } from './pages/horarios/horarios.component';
import { authGuard } from './guards/auth.guard';
import { materiasTreeGuard } from './guards/materias-tree.guard';
import { adminGuard } from './guards/admin.guard';
import { SolicitudesAyudanteAdminComponent } from './pages/solicitudes-ayudante-admin/solicitudes-ayudante-admin.component';

export const routes: Routes = [

  {
    path: '',
    component: SplashComponent
  },

  {
    path: 'registro',
    component: Registro
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'recuperar-contrasena',
    component: RecuperarContrasena
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [materiasTreeGuard]
  },

  {
    path: 'materias',
    component: MateriasComponent
  },

  {
    path: 'horarios',
    component: HorariosComponent
  },

  {
    path: 'materias/:materiaId',
    component: MateriaDetalleComponent
  },

  {
    path: 'administracion/solicitudes-ayudante',
    component: SolicitudesAyudanteAdminComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: 'registro'
  }
];
