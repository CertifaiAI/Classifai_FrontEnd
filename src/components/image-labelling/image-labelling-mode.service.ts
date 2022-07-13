/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BehaviorSubject } from 'rxjs';
import { ImageLabellingMode } from 'shared/types/labelling-type/image-labelling.model';
import { Injectable } from '@angular/core';

const initialValue: ImageLabellingMode = null;

@Injectable({
    providedIn: 'root',
})
export class ImageLabellingModeService {
    private imgLabellingModeSubject = new BehaviorSubject<ImageLabellingMode>(initialValue);

    public imgLabelMode$ = this.imgLabellingModeSubject.asObservable();

    // pass null value to reset state
    public setState = (inComingMode: ImageLabellingMode) => {
        inComingMode
            ? this.imgLabellingModeSubject.next(inComingMode)
            : this.imgLabellingModeSubject.next(initialValue);
    };
}
