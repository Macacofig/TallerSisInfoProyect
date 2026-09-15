import { Routes } from '@angular/router';

import { SplashComponent } from './pages/splash/splash.component';
import { MateriasComponent } from './pages/materias/materias.component';
import { MateriaDetalleComponent } from './pages/materias/detail/materia-detalle.component';

export const routes: Routes = [
  {
    path: '',
    component: SplashComponent
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