import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { FeatureToggleService } from '../services/feature-toggle.service';

export const materiasTreeGuard: CanActivateFn = () => {
  const featureToggleService = inject(FeatureToggleService);
  const router = inject(Router);

  return featureToggleService.arbolMaterias()
    ? true
    : router.createUrlTree(['/materias']);
};
