import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    constructor() {}

    returnAsObservable(): Observable<boolean> {
        return this.loadingSubject.asObservable();
    }

    showSpinner(): void {
        this.loadingSubject.next(true);
    }
    hideSpinner(): void {
        this.loadingSubject.next(false);
    }
}
