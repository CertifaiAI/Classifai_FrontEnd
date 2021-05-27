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

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export type AnnotateActionState = {
    annotation: number;
    isDlbClick: boolean;
};

const initialState: AnnotateActionState = {
    annotation: -1,
    isDlbClick: false,
};

@Injectable({
    providedIn: 'any',
})
export class AnnotateSelectionService {
    private labelStateSubject = new BehaviorSubject<AnnotateActionState>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    /**
     * @function seState handles update state in service
     * @param newState if no value, setState will reset state to initialState
     * else merge state given onto existing state
     */
    public setState = (newState?: Partial<AnnotateActionState>): void => {
        newState
            ? this.labelStateSubject.next({ ...initialState, ...newState })
            : this.labelStateSubject.next(initialState);
    };
}
