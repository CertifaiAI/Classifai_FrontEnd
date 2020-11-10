import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnnotateAction } from '../../layouts/image-labelling-layout/image-labelling-layout.model';

const initialState: AnnotateAction = {
    annotation: -1,
    isDlbClick: false,
};

@Injectable({
    providedIn: 'any',
})
export class AnnotateSelectionService {
    private labelStateSubject = new BehaviorSubject<AnnotateAction>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    public mutateState = (inComingState: Partial<AnnotateAction>): void => {
        inComingState
            ? (console.log({ ...initialState, ...inComingState }),
              this.labelStateSubject.next({ ...initialState, ...inComingState }))
            : this.labelStateSubject.next(initialState);
    };
}
