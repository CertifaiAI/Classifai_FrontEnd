import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { annotateAction } from '../../layouts/image-labelling-layout/image-labelling-layout.model';

const initialState: annotateAction = {
    annotation: -1,
    isDlbClick: false,
};

@Injectable({
    providedIn: 'any',
})
export class AnnotateSelectionService {
    private labelStateSubject = new BehaviorSubject<annotateAction>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    public mutateState = (inComingState: Partial<annotateAction>): void => {
        inComingState
            ? (console.log(inComingState), this.labelStateSubject.next({ ...initialState, ...inComingState }))
            : this.labelStateSubject.next(initialState);
    };
}
