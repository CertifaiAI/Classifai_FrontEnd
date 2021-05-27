/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VideoTimelineComponent } from './video-timeline.component';

@NgModule({
    imports: [CommonModule],
    declarations: [VideoTimelineComponent],
    exports: [VideoTimelineComponent],
})
export class VideoTimelineModule {}
