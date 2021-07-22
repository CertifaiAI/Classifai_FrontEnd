/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'shared/shared.module';
import { VideoLabellingLayoutComponent } from './video-labelling-layout.component';
import { VideoLabellingLayoutRoutingModule } from './video-labelling-layout-routing.module';
import { VideoLabellingModule } from 'components/video-labelling/video-labelling.module';

@NgModule({
    imports: [CommonModule, SharedModule, VideoLabellingLayoutRoutingModule, VideoLabellingModule],
    declarations: [VideoLabellingLayoutComponent],
})
export class VideoLabellingLayoutModule {}
