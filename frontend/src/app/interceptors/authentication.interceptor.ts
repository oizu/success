import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const item = localStorage.getItem('current_user');

    if (item) {
      const user = JSON.parse(item);

      if (user) {
        const auth_req = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${user.tokens[0]}`)
        });
        return next.handle(auth_req);
      }
    }

    return next.handle(req);  }
}
