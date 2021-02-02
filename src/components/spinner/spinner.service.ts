import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    private toggleSpinnerSubject = new BehaviorSubject<boolean>(false);
    constructor() {}

    returnAsObservable(): Observable<boolean> {
        return this.toggleSpinnerSubject.asObservable();
    }

    showSpinner(): void {
        this.toggleSpinnerSubject.next(true);
    }
    hideSpinner(): void {
        this.toggleSpinnerSubject.next(false);
    }
}
