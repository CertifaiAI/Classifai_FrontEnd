/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    imports: [CommonModule, TranslateModule, NgxChartsModule],
    declarations: [PieChartComponent],
    exports: [PieChartComponent],
})
export class PieChartModule {}
