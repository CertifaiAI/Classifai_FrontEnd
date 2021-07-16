/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImageLabellingFooterComponent } from 'components/image-labelling/image-labelling-footer/image-labelling-footer.component';
import { ImageLabellingInfoComponent } from 'components/image-labelling/image-labelling-info/image-labelling-info.component';
import { ImageLabellingLeftSidebarComponent } from 'components/image-labelling/image-labelling-left-sidebar/image-labelling-left-sidebar.component';
import { ImageLabellingObjectDetectionComponent } from 'components/image-labelling/image-labelling-object-detection/image-labelling-object-detection.component';
import { ImageLabellingProjectComponent } from 'components/image-labelling/image-labelling-project/image-labelling-project.component';
import { ImageLabellingRightSidebarComponent } from 'components/image-labelling/image-labelling-right-sidebar/image-labelling-right-sidebar.component';
import { ImageLabellingSegmentationComponent } from 'components/image-labelling/image-labelling-segmentation/image-labelling-segmentation.component';
import { SharedModule } from 'shared/shared.module';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        ImageLabellingInfoComponent,
        ImageLabellingLeftSidebarComponent,
        ImageLabellingProjectComponent,
        ImageLabellingRightSidebarComponent,
        ImageLabellingFooterComponent,
        ImageLabellingObjectDetectionComponent,
        ImageLabellingSegmentationComponent,
    ],
    exports: [
        ImageLabellingInfoComponent,
        ImageLabellingLeftSidebarComponent,
        ImageLabellingProjectComponent,
        ImageLabellingRightSidebarComponent,
        ImageLabellingFooterComponent,
        ImageLabellingObjectDetectionComponent,
        ImageLabellingSegmentationComponent,
    ],
})
export class ImageLabellingModule {}
