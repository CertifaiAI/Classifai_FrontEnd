/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    // pass null value to reset state
    public setState = (inComingMode: ImageLabellingMode) => {
        inComingMode
            ? this.imgLabellingModeSubject.next(inComingMode)
            : this.imgLabellingModeSubject.next(initialValue);
    };
}
