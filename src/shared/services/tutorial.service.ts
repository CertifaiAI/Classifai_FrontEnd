/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TutorialState = {
    createProject: boolean;
    drawBbox: boolean;
    drawPolygon: boolean;
    projectStatistics: boolean;
};

const initialState: TutorialState = {
    createProject: false,
    drawBbox: false,
    drawPolygon: false,
    projectStatistics: false,
};

@Injectable({
    providedIn: 'any',
})
export class TutorialService {
    private tutorialSubject = new BehaviorSubject<TutorialState>(initialState);
    public tutorial$ = this.tutorialSubject.asObservable();
    private dataFromLocalStorage = initialState;

    constructor() {
        const gg = this.getLocalStorage();
        if (gg === null) {
            this.setLocalStorage(initialState);
        } else {
            this.dataFromLocalStorage = JSON.parse(gg).cache;
            this.setState(JSON.parse(gg).cache);
        }
    }

    setState = (newZoomState?: Partial<TutorialState>): void => {
        localStorage.getItem('tutorial');
        if (newZoomState) {
            this.tutorialSubject.next({ ...this.dataFromLocalStorage, ...newZoomState });
            this.setLocalStorage(this.tutorialSubject.getValue());
        } else {
            this.tutorialSubject.next(initialState);
        }
    };

    resetZoomScale() {
        this.tutorialSubject.next(initialState);
    }

    private setLocalStorage(state: TutorialState) {
        localStorage.setItem('tutorial', JSON.stringify({ cache: state }));
    }

    private getLocalStorage() {
        return localStorage.getItem('tutorial');
    }
}
