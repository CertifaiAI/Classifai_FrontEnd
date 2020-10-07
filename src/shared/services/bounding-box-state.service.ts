import { ActionRules } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'any',
})
export class BoundingBoxStateService {
    private source = new BehaviorSubject<ActionRules>({
        scroll: true,
        drag: false,
        draw: false,
        selectedBox: -1,
    });

    public currentValue = this.source.asObservable();

    constructor() {}

    public valueChange(newValue: ActionRules): void {
        try {
            this.source.next(newValue);
        } catch (err) {
            console.log('Bbox Data Service ValueChange(newValue:ActionRules):void', err.name + ': ', err.message);
        }
    }
}
