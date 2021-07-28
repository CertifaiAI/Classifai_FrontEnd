/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoUploadComponent } from 'components/video-labelling/video-upload/video-upload.component';
import { VideoLabellingLayoutComponent } from './video-labelling-layout.component';

const videoLabellingLayoutRoutes: Routes = [
    {
        path: '',
        component: VideoLabellingLayoutComponent,
    },
    {
        path: 'upload',
        component: VideoUploadComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(videoLabellingLayoutRoutes)],
})
export class VideoLabellingLayoutRoutingModule {}
