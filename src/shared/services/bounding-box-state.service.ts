import { BehaviorSubject } from 'rxjs';
import { BoundingBoxActionState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';

const initialValue = {
    scroll: true,
    drag: false,
    draw: false,
    selectedBox: -1,
    fitCenter: false,
};

@Injectable({
    providedIn: 'any',
})
export class BoundingBoxStateService {
    private boundingBoxSubject = new BehaviorSubject<BoundingBoxActionState>(initialValue);

    public boundingBox$ = this.boundingBoxSubject.asObservable();

    constructor() {}

    public setState = (newState: Partial<BoundingBoxActionState>): void => {
        newState
            ? this.boundingBoxSubject.next({ ...initialValue, ...newState })
            : this.boundingBoxSubject.next(initialValue);
        this.boundingBox$.subscribe((val) => console.log(val));
    };
}
