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
                        this.pendingRequestsCount === 0 && this._spinner.hideSpinner();
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
