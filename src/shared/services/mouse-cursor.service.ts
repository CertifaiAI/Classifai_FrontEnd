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
import { WheelDelta } from 'src/shared/services/zoom.service';

export type MouseCursorState = {
    move: boolean;
    pointer: boolean;
    grab: boolean;
    grabbing: boolean;
    crosshair: boolean;
    'zoom-in': boolean;
    'zoom-out': boolean;
    'n-resize': boolean;
    'w-resize': boolean;
    'ne-resize': boolean;
    'nw-resize': boolean;
    'se-resize': boolean;
    'sw-resize': boolean;
};

const initialState: MouseCursorState = {
    move: false,
    pointer: false,
    grab: false,
    grabbing: false,
    crosshair: false,
    'zoom-in': false,
    'zoom-out': false,
    'n-resize': false,
    'w-resize': false,
    'ne-resize': false,
    'nw-resize': false,
    'se-resize': false,
    'sw-resize': false,
};

@Injectable({
    providedIn: 'any',
})
export class MousrCursorService {
    private mouseCursorSubject = new BehaviorSubject<MouseCursorState>(initialState);
    public mouseCursor$ = this.mouseCursorSubject.asObservable();

    constructor() {}

    setState = (newCursorState?: Partial<MouseCursorState>): void => {
        newCursorState
            ? this.mouseCursorSubject.next({ ...initialState, ...newCursorState })
            : this.mouseCursorSubject.next(initialState);
    };

    changeCursor(mouseCursor: MouseCursorState, event?: WheelEvent & WheelDelta) {
        if (event) {
            const { wheelDelta, detail } = event;
            if (wheelDelta !== undefined) {
                wheelDelta === 150
                    ? this.setState({ 'zoom-in': true })
                    : wheelDelta === -150 && this.setState({ 'zoom-out': true });
            } else {
                detail === 3
                    ? this.setState({ 'zoom-in': true })
                    : detail === -3 && this.setState({ 'zoom-out': true });
            }
        } else {
            for (const [key, value] of Object.entries(mouseCursor)) {
                if (value === true) {
                    return key;
                }
            }
        }
    }
}
