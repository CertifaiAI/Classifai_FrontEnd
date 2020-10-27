import { Injectable } from '@angular/core';
import { labelState } from '../../layouts/image-labelling-layout/image-labelling-layout.model';
import { BehaviorSubject } from 'rxjs';

const initialState: labelState = {
    selectedAnnotate: -1,
};

@Injectable({
    providedIn: 'any',
})
export class BboxLabelService {
    private labelStateSubject = new BehaviorSubject<labelState>(initialState);
    public labelStaging$ = this.labelStateSubject.asObservable();

    constructor() {}

    public mutateState = (inComingState: Partial<labelState>): void => {
        inComingState
            ? this.labelStateSubject.next({ ...initialState, ...inComingState })
            : this.labelStateSubject.next(initialState);
    };
}
