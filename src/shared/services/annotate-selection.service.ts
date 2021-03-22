import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export type AnnotateActionState = {
    annotation: number;
    isDlbClick: boolean;
};

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

    /**
     * @function seState handles update state in service
     * @param newState if no value, setState will reset state to initialState
     * else merge state given onto existing state
     */
    public setState = (newState?: Partial<AnnotateActionState>): void => {
        newState
            ? this.labelStateSubject.next({ ...initialState, ...newState })
            : this.labelStateSubject.next(initialState);
    };
}
