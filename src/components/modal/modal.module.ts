/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [CommonModule],
    declarations: [ModalComponent],
    exports: [ModalComponent],
})
export class ModalModule {}
