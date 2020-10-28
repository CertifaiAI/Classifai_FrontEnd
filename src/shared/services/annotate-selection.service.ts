import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-es';

const initialState: number = -1;

@Injectable({
    providedIn: 'any',
})
export class AnnotateSelectionService {
    private labelStateSubject = new BehaviorSubject<number>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    public mutateState = (inComingState: number): void => {
        inComingState !== null
            ? (console.log(inComingState), this.labelStateSubject.next(cloneDeep(inComingState)))
            : this.labelStateSubject.next(initialState);
    };
}
