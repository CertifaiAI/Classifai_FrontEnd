import { BehaviorSubject } from 'rxjs';
import { BoundingBoxActionState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';

const initialValue: BoundingBoxActionState = {
    scroll: true,
    drag: false,
    draw: false,
    selectedBox: -1,
    fitCenter: false,
    clear: false,
    dbClick: false,
};

@Injectable({
    providedIn: 'root',
})
export class BoundingBoxStateService {
    private boundingBoxSubject = new BehaviorSubject<BoundingBoxActionState>(initialValue);

    public boundingBox$ = this.boundingBoxSubject.asObservable();

    constructor() {}

    public setState = (inComingState: Partial<BoundingBoxActionState>): void => {
        inComingState
            ? this.boundingBoxSubject.next({ ...initialValue, ...inComingState })
            : this.boundingBoxSubject.next(initialValue);
    };
}
