import { ActionState } from 'src/components/image-labelling/image-labelling.model';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

const initialValue: ActionState = {
    scroll: true,
    drag: false,
    draw: false,
    fitCenter: false,
    clear: false,
    isActiveModal: false,
};

@Injectable({
    providedIn: 'any',
})
export class SegmentationStateService {
    private segSubject = new BehaviorSubject<ActionState>(initialValue);

    public segmentation$ = this.segSubject.asObservable();
    constructor() {}

    public setState = (inComingState: Partial<ActionState>): void => {
        inComingState
            ? this.segSubject.next({ ...initialValue, ...inComingState })
            : this.segSubject.next(initialValue);
    };
}
