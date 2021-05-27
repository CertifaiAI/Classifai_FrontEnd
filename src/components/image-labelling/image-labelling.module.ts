/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { ImageLabellingFooterComponent } from 'src/components/image-labelling/image-labelling-footer/image-labelling-footer.component';
import { ImageLabellingInfoComponent } from 'src/components/image-labelling/image-labelling-info/image-labelling-info.component';
import { ImageLabellingLeftSidebarComponent } from 'src/components/image-labelling/image-labelling-left-sidebar/image-labelling-left-sidebar.component';
import { ImageLabellingObjectDetectionComponent } from 'src/components/image-labelling/image-labelling-object-detection/image-labelling-object-detection.component';
import { ImageLabellingProjectComponent } from 'src/components/image-labelling/image-labelling-project/image-labelling-project.component';
import { ImageLabellingRightSidebarComponent } from 'src/components/image-labelling/image-labelling-right-sidebar/image-labelling-right-sidebar.component';
import { ImageLabellingSegmentationComponent } from 'src/components/image-labelling/image-labelling-segmentation/image-labelling-segmentation.component';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

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
