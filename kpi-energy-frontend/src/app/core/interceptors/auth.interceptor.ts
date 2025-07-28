import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {TokenStorageService} from '../services/token-storage.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  if (token && req.url.includes('/api/')) {  // Only add to API requests
    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
    });
    return next(authReq);
  }
  return next(req);
};
