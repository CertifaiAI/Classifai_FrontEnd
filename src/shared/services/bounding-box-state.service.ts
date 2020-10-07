import { BehaviorSubject } from 'rxjs';
import { BoundingBoxActionState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';

const initialValue = {
    scroll: true,
    drag: false,
    draw: false,
    selectedBox: -1,
};

@Injectable({
    providedIn: 'any',
})
export class BoundingBoxStateService {
    private source = new BehaviorSubject<BoundingBoxActionState>(initialValue);

    public currentValue = this.source.asObservable();

    constructor() {}

    public setState = (newValue: Partial<BoundingBoxActionState>): void => {
        try {
            newValue ? this.source.next({ ...initialValue, ...newValue }) : this.source.next(initialValue);
        } catch (err) {
            console.log(
                'Bbox Data Service setState(newValue:BoundingBoxActionState):void',
                err.name + ': ',
                err.message,
            );
        }
    };
}
