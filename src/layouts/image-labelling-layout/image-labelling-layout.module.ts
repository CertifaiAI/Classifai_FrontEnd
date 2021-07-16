/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { ImageLabellingLayoutRoutingModule } from './image-labelling-layout-routing.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ImageLabellingModule } from 'components/image-labelling/image-labelling.module';
import { ModalModule } from 'components/modal/modal.module';
import { PageHeaderModule } from 'components/page-header/page-header.module';
import { SharedModule } from 'shared/shared.module';

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
