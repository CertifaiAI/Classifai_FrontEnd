/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { VideoDataSetLayoutComponent } from './video-data-set-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const dataSetRoutes: Routes = [
    {
        path: '',
        component: VideoDataSetLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(dataSetRoutes)],
})
export class VideoDataSetRoutingModule {}
