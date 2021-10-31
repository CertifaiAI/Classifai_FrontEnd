/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { VideoDataSetLayoutComponent } from './video-data-set-layout.component';
import { VideoDataSetRoutingModule } from './video-data-set-layout-routing.module';
import { NgModule } from '@angular/core';
import { DataSetLayoutModule } from '../data-set-layout/data-set-layout.module';
import { SharedModule } from 'shared/shared.module';
import { VideoLabellingModule } from '../../components/video-labelling/video-labelling.module';
import { VideoLabellingLayoutModule } from '../video-labelling-layout/video-labelling-layout.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        VideoDataSetRoutingModule,
        DataSetLayoutModule,
        VideoLabellingModule,
        VideoLabellingLayoutModule,
    ],
    declarations: [VideoDataSetLayoutComponent],
    exports: [VideoDataSetLayoutComponent],
})
export class VideoDataSetLayoutModule {}
