import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';

@Injectable({ providedIn: 'any' })
export class ResponseJsonInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event) => {
        if (
          event instanceof HttpResponse &&
          event.headers.get('Content-Type').indexOf('application/json') >= 0
        ) {
          event = event.clone({
            body: event,
          });
        }
        return event;
      }),
      (error: Observable<HttpEvent<any>>) => {
        if (error instanceof HttpErrorResponse) {
          console.log(error);
          return error;
        }
        return error;
      }
      // catchError((error: any) => {
      //   if (error instanceof HttpErrorResponse) {
      //     // try {
      //     //   this.toasterService.error(err.error.message, err.error.title, {
      //     //     positionClass: 'toast-bottom-center',
      //     //   });
      //     // } catch (e) {
      //     //   this.toasterService.error('An error occurred', '', {
      //     //     positionClass: 'toast-bottom-center',
      //     //   });
      //     // }
      //     //log error
      //     return of(error);
      //     // return scheduled([error], asapScheduler);
      //   }
      //   // return scheduled([error], asapScheduler);
      //   return of(error);
      // })
    );
  }
}
