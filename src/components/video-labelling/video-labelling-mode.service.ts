/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoLabellingMode } from 'shared/types/video-labelling/video-labelling.model';

const initialValue: VideoLabellingMode = null;

@Injectable({
    providedIn: 'root',
})
export class VideoLabellingModeService {
    private videoLabellingModeSubject = new BehaviorSubject<VideoLabellingMode>(initialValue);

    public videoLabelMode$ = this.videoLabellingModeSubject.asObservable();

    // pass null value to reset state
    public setState = (inComingMode: VideoLabellingMode) => {
        inComingMode
            ? this.videoLabellingModeSubject.next(inComingMode)
            : this.videoLabellingModeSubject.next(initialValue);
    };
}
