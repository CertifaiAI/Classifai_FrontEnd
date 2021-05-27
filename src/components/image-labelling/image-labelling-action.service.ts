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

import { ActionState } from './image-labelling.model';
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
    providedIn: 'any',
})
export class ImageLabellingActionService {
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
