/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
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
