import { Routes } from '@angular/router';

import { SplashComponent } from './pages/splash/splash.component';
import { HomeComponent } from './pages/home/home.component';
import { MateriasComponent } from './pages/materias/materias.component';
import { MateriaDetalleComponent } from './pages/materias/detail/materia-detalle.component';

import { Registro } from './pages/registro/registro';
import { Login } from './pages/login/login';

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
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'materias',
    component: MateriasComponent
  },

  {
    path: 'materias/:materiaId',
    component: MateriaDetalleComponent
  }

];