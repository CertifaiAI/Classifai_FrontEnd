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
