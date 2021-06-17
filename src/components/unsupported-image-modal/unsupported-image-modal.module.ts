/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { UnsupportedImageModalComponent } from './unsupported-image-modal.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from '../modal/modal.module';

@NgModule({
    imports: [CommonModule, TranslateModule, ModalModule],
    declarations: [UnsupportedImageModalComponent],
    exports: [UnsupportedImageModalComponent],
})
export class UnsupportedImageModalModule {}
