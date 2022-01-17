/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { VideoLabellingLeftSidebarComponent } from './video-labelling-left-sidebar/video-labelling-left-sidebar.component';
// import { VideoLabellingRightSidebarComponent } from './video-labelling-right-sidebar/video-labelling-right-sidebar.component';
import { VideoLabellingObjectDetectionComponent } from './video-labelling-object-detection/video-labelling-object-detection.component';
import { VideoLabellingProjectComponent } from './video-labelling-project/video-labelling-project.component';
import { VideoLabellingInfoComponent } from './video-labelling-info/video-labelling-info.component';
// import { VideoLabellingFooterComponent } from './video-labelling-footer/video-labelling-footer.component';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        VideoLabellingLeftSidebarComponent,
        // VideoLabellingRightSidebarComponent,
        VideoLabellingObjectDetectionComponent,
        VideoLabellingProjectComponent,
        VideoLabellingInfoComponent,
        // VideoLabellingFooterComponent,
    ],
    exports: [
        VideoLabellingLeftSidebarComponent,
        // VideoLabellingRightSidebarComponent,
        VideoLabellingObjectDetectionComponent,
        VideoLabellingProjectComponent,
        VideoLabellingInfoComponent,
        // VideoLabellingFooterComponent,
    ],
})
export class VideoLabellingModule {}
