// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';

// @Injectable({ providedIn: 'any' })
// export class JsonRequestInterceptor implements HttpInterceptor {
//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     req = req.clone({
//       withCredentials: true,
//     });
//     // request.headers.append('Accept-Encoding', 'gzip');
//     // request.headers.append('Accept-Encoding', 'br');
//     // request.headers.set('Content-Encoding', 'br');
//     return next.handle(req);
//   }
// }
