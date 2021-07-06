/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    private toggleSpinnerSubject = new BehaviorSubject<boolean>(false);

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
