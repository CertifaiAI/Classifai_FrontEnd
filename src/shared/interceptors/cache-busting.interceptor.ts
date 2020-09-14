import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CacheBustingInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const cacheBustingReq = req.clone({
            setHeaders: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        });
        return next.handle(cacheBustingReq);
    }
}
