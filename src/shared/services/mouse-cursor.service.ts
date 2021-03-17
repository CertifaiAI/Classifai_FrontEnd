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
    resize: boolean;
};

const initialState: MouseCursorState = {
    move: false,
    pointer: false,
    grab: false,
    grabbing: false,
    crosshair: false,
    'zoom-in': false,
    'zoom-out': false,
    resize: false,
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
