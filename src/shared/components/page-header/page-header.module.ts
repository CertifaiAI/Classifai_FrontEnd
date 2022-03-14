import { ModalModule } from 'shared/components/modal/modal.module';
/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from './page-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, RouterModule, TranslateModule, ModalModule, ReactiveFormsModule, FormsModule],
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent],
})
export class PageHeaderModule {}
