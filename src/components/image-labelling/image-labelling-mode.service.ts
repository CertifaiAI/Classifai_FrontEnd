import { BehaviorSubject } from 'rxjs';
import { ImageLabellingMode } from './image-labelling.model';
import { Injectable } from '@angular/core';

const initialValue: ImageLabellingMode = null;

@Injectable({
    providedIn: 'root',
})
export class ImageLabellingModeService {
    private imgLabellingModeSubject = new BehaviorSubject<ImageLabellingMode>(initialValue);

    public imgLabelMode$ = this.imgLabellingModeSubject.asObservable();

    constructor() {}

    public setState = (inComingMode: ImageLabellingMode) => {
        inComingMode
            ? this.imgLabellingModeSubject.next(inComingMode)
            : this.imgLabellingModeSubject.next(initialValue);
    };
}
