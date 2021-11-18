/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WheelDelta } from 'shared/services/zoom.service';

export type MouseCursorState = {
    move: boolean;
    pointer: boolean;
    grab: boolean;
    grabbing: boolean;
    crosshair: boolean;
    default: boolean;
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
    default: false,
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
