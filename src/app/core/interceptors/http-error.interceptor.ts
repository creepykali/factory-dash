import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError(error => {
      console.error('[HTTP ERROR]', error);
      return throwError(() => error);
    })
  );