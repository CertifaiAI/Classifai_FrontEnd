import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { segActionState } from 'src/layouts/image-labelling-layout/image-labelling-layout.model';

const initialValue: segActionState = {
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
    private segSubject = new BehaviorSubject<segActionState>(initialValue);

    public segmentation$ = this.segSubject.asObservable();
    constructor() {}

    public setState = (inComingState: Partial<segActionState>): void => {
        inComingState
            ? this.segSubject.next({ ...initialValue, ...inComingState })
            : this.segSubject.next(initialValue);
    };
}
