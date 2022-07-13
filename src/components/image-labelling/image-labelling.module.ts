/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { ImageLabellingInfoComponent } from 'components/image-labelling/image-labelling-info/image-labelling-info.component';
import { ImageLabellingObjectDetectionComponent } from 'components/image-labelling/image-labelling-object-detection/image-labelling-object-detection.component';
import { ImageLabellingProjectComponent } from 'components/image-labelling/image-labelling-project/image-labelling-project.component';
import { ImageLabellingSegmentationComponent } from 'components/image-labelling/image-labelling-segmentation/image-labelling-segmentation.component';
import { NgModule } from '@angular/core';
import { SharedModule } from 'shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        ImageLabellingInfoComponent,
        ImageLabellingProjectComponent,
        ImageLabellingObjectDetectionComponent,
        ImageLabellingSegmentationComponent,
    ],
    exports: [
        ImageLabellingInfoComponent,
        ImageLabellingProjectComponent,
        ImageLabellingObjectDetectionComponent,
        ImageLabellingSegmentationComponent,
    ],
})
export class ImageLabellingModule {}
