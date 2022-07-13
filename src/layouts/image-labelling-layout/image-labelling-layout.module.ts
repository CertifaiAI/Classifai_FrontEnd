/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BarChartModule } from 'shared/components/charts/bar-chart/bar-chart.module';
import { CommonModule } from '@angular/common';
import { FooterModule } from 'shared/components/footer/footer.module';
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { ImageLabellingLayoutRoutingModule } from './image-labelling-layout-routing.module';
import { ImageLabellingModule } from 'components/image-labelling/image-labelling.module';
import { LeftSidebarModule } from 'shared/components/left-sidebar/left-sidebar.module';
import { ModalModule } from 'shared/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from 'shared/components/page-header/page-header.module';
import { PieChartModule } from 'shared/components/charts/pie-chart/pie-chart.module';
import { RightSidebarModule } from 'shared/components/right-sidebar/right-sidebar.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
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
        BarChartModule,
        PieChartModule,
        LeftSidebarModule,
        RightSidebarModule,
        FooterModule,
    ],
    declarations: [ImageLabellingLayoutComponent],
})
export class ImageLabellingLayoutModule {}
