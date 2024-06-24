import { HttpInterceptorFn } from '@angular/common/http';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = localStorage.getItem('jwt');

  if (jwt) {
    const auth_req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${jwt}`)
    });
    return next(auth_req);
  }

  return next(req);
};
