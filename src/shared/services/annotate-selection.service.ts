import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnnotateActionState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';

const initialState: AnnotateActionState = {
    annotation: -1,
    isDlbClick: false,
};

@Injectable({
    providedIn: 'any',
})
export class AnnotateSelectionService {
    private labelStateSubject = new BehaviorSubject<AnnotateActionState>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    public mutateState = (inComingState: Partial<AnnotateActionState>): void => {
        inComingState
            ? this.labelStateSubject.next({ ...initialState, ...inComingState })
            : this.labelStateSubject.next(initialState);
    };
}
