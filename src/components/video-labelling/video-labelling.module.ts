/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { VideoLabellingLeftSidebarComponent } from './video-labelling-left-sidebar/video-labelling-left-sidebar.component';
import { VideoLabellingRightSidebarComponent } from './video-labelling-right-sidebar/video-labelling-right-sidebar.component';
import { VideoLabellingObjectDetectionComponent } from './video-labelling-object-detection/video-labelling-object-detection.component';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        VideoLabellingLeftSidebarComponent,
        VideoLabellingRightSidebarComponent,
        VideoLabellingObjectDetectionComponent,
    ],
    exports: [
        VideoLabellingLeftSidebarComponent,
        VideoLabellingRightSidebarComponent,
        VideoLabellingObjectDetectionComponent,
    ],
})
export class VideoLabellingModule {}