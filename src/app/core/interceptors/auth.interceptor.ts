import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const storageService = inject(StorageService);
  const token = storageService.obtenerToken();

  if (!token) {
    return next(req);
  }

  const requestConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestConToken);
};