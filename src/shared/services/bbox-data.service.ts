import { ActionRules } from './../../layouts/image-labelling-layout/image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'any',
})
export class BboxDataService {
    private Source = new BehaviorSubject<ActionRules>({
        scroll: false,
        drag: false,
        draw: true,
        selectedBox: -1,
    });

    public currentValue = this.Source.asObservable();

    constructor() {}

    public valueChange(newValue: ActionRules): void {
        try {
            this.Source.next(newValue);
        } catch (err) {
            console.log('Bbox Data Service ValueChange(newValue:ActionRules):void', err.name + ': ', err.message);
        }
    }
}
