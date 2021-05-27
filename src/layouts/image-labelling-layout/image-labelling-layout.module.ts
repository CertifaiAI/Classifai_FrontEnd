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
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { ImageLabellingLayoutRoutingModule } from './image-labelling-layout-routing.module';
import { ImageLabellingModule } from 'src/components/image-labelling/image-labelling.module';
import { ModalModule } from 'src/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from 'src/components/page-header/page-header.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
        ImageLabellingLayoutRoutingModule,
        ModalModule,
        RouterModule,
        PageHeaderModule,
        ImageLabellingModule,
    ],
    declarations: [ImageLabellingLayoutComponent],
})
export class ImageLabellingLayoutModule {}
