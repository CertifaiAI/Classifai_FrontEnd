import { BoundingBoxLayoutComponent } from './bounding-box-layout.component';
import { BoundingBoxRoutingModule } from './bounding-box-layout-routing.module';
import { CommonModule } from '@angular/common';
import { ImageLabellingModule } from 'src/components/image-labelling/image-labelling.module';
import { ModalModule } from 'src/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from 'src/components/page-header/page-header.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
        BoundingBoxRoutingModule,
        ModalModule,
        RouterModule,
        PageHeaderModule,
        ImageLabellingModule,
    ],
    declarations: [BoundingBoxLayoutComponent],
})
export class BoundingBoxLayoutModule {}
