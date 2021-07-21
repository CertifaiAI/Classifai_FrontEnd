/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SpinnerComponent } from './spinner.component';

@NgModule({
    imports: [CommonModule],
    declarations: [SpinnerComponent],
    exports: [SpinnerComponent],
})
export class SpinnerModule {}
