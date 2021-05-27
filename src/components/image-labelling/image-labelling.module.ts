/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
