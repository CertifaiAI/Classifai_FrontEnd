/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const imageLabellingLayoutRoutes: Routes = [
    {
        path: '',
        component: ImageLabellingLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(imageLabellingLayoutRoutes)],
})
export class ImageLabellingLayoutRoutingModule {}
