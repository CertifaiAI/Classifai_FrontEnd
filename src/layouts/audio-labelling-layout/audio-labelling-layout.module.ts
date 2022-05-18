import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from '../../shared/components/modal/modal.module';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '../../shared/components/page-header/page-header.module';
import { BarChartModule } from '../../shared/components/charts/bar-chart/bar-chart.module';
import { PieChartModule } from '../../shared/components/charts/pie-chart/pie-chart.module';
import { AudioLabellingLayoutComponent } from './audio-labelling-layout.component';
import { AudioLabellingLayoutRoutingModule } from './audio-labelling-layout-routing.module';
import { AudioLabellingModule } from '../../components/audio-labelling/audio-labelling.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
        ModalModule,
        RouterModule,
        PageHeaderModule,
        BarChartModule,
        PieChartModule,
        AudioLabellingLayoutRoutingModule,
        AudioLabellingModule,
    ],
    declarations: [AudioLabellingLayoutComponent],
})
export class AudioLabellingLayoutModule {}
