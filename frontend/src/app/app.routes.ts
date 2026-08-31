import { Routes } from '@angular/router';

import { SplashComponent } from './pages/splash/splash.component';
import { MateriasComponent } from './pages/materias/materias.component';

export const routes: Routes = [
  {
    path: '',
    component: SplashComponent
  },
  {
    path: 'materias',
    component: MateriasComponent
  }
];
