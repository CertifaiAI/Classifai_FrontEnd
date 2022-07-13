import { AudioLabellingLayoutComponent } from './audio-labelling-layout.component';
import { AudioLabellingLayoutRoutingModule } from './audio-labelling-layout-routing.module';
import { BarChartModule } from '../../shared/components/charts/bar-chart/bar-chart.module';
import { CommonModule } from '@angular/common';
import { FooterModule } from 'shared/components/footer/footer.module';
import { LeftSidebarModule } from 'shared/components/left-sidebar/left-sidebar.module';
import { ModalModule } from '../../shared/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from '../../shared/components/page-header/page-header.module';
import { PieChartModule } from '../../shared/components/charts/pie-chart/pie-chart.module';
import { RightSidebarModule } from 'shared/components/right-sidebar/right-sidebar.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild(),
        ModalModule,
        RouterModule,
        PageHeaderModule,
        BarChartModule,
        PieChartModule,
        AudioLabellingLayoutRoutingModule,
        LeftSidebarModule,
        RightSidebarModule,
        FooterModule,
    ],
    declarations: [AudioLabellingLayoutComponent],
})
export class AudioLabellingLayoutModule {}
