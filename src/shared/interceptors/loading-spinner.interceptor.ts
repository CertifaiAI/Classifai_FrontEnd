/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'src/components/spinner/spinner.service';
import { tap } from 'rxjs/operators';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';

@Injectable()
export class LoadingSpinnerInterceptor implements HttpInterceptor {
    pendingRequestsCount: number = 0;
    constructor(private _spinner: SpinnerService) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // initiate spinner
        this.pendingRequestsCount++;
        this._spinner.showSpinner();
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {
                    // console.log(event);
                    if (event instanceof HttpResponse) {
                        this.pendingRequestsCount--;
                        const link = event.url ? event.url.toString().split('/') : '';
                        this.pendingRequestsCount === 0 &&
                            link[link.length - 1] !== 'importstatus' &&
                            link[link.length - 1] !== 'folders' &&
                            link[link.length - 1] !== 'labelfiles' &&
                            this._spinner.hideSpinner();
                    }
                },
                (error) => {
                    if (error instanceof HttpErrorResponse) {
                        this.pendingRequestsCount--;
                        // hide spinner when you receive error
                        this._spinner.hideSpinner();
                        // console.log(error);
                    }
                },
            ),
            // finalize(() => (console.log('x'))),
        );
    }
}
