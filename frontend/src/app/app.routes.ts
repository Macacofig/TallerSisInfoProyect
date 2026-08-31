import { Routes } from '@angular/router';

import { SplashComponent } from './splash/splash.component';
import { MateriasComponent } from './materias/materias.component';

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