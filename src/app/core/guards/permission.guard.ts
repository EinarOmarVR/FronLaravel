import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { StorageService } from '../services/storage.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const storageService = inject(StorageService);
  const router = inject(Router);

  const permiso = route.data['permiso'] as string;

  if (
    permiso &&
    storageService.tienePermiso(permiso)
  ) {
    return true;
  }

  const rutaPermitida =
    storageService.obtenerRutaInicial();

  return router.createUrlTree([rutaPermitida]);
};