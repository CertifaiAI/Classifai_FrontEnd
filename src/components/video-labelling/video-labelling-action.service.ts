/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ActionState } from './video-labelling.modal';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

const initialValue: ActionState = {
    scroll: false,
    drag: false,
    draw: false,
    fitCenter: false,
    clear: false,
    isActiveModal: false,
    save: false,
};

@Injectable({
    providedIn: 'root',
})
export class VideoLabellingActionService {
    private actionSubject = new BehaviorSubject<ActionState>(initialValue);

    public action$ = this.actionSubject.asObservable();

    constructor() {}

    // pass null value to reset state
    public setState = (inComingState: Partial<ActionState> | null): void => {
        inComingState
            ? this.actionSubject.next({ ...initialValue, ...inComingState })
            : this.actionSubject.next(initialValue);
    };
}
