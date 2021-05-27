/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
                            link[link.length - 1] !== 'filesysstatus' &&
                            link[link.length - 1] !== 'labelfilestatus' &&
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
