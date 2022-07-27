import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from '../../shared/components/modal/modal.module';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '../../shared/components/page-header/page-header.module';
import { BarChartModule } from '../../shared/components/charts/bar-chart/bar-chart.module';
import { PieChartModule } from '../../shared/components/charts/pie-chart/pie-chart.module';
import { TabularLabellingLayoutComponent } from './tabular-labelling-layout.component';
import { TabularLabellingLayoutRoutingModule } from './tabular-labelling-layout-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TabularLabellingModule } from '../../components/tabular-labelling/tabular-labelling.module';
import { AgGridModule } from 'ag-grid-angular';

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
        TabularLabellingLayoutRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxChartsModule,
        TabularLabellingModule,
        AgGridModule.withComponents([]),
    ],
    declarations: [TabularLabellingLayoutComponent],
})
export class TabularLabellingLayoutModule {}
