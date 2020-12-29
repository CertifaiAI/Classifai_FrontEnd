import { CommonModule } from '@angular/common';
import { ImageLabellingFooterComponent } from './image-labelling-footer/image-labelling-footer.component';
import { ImageLabellingInfoComponent } from './image-labelling-info/image-labelling-info.component';
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { ImageLabellingLeftSidebarComponent } from './image-labelling-left-sidebar/image-labelling-left-sidebar.component';
import { ImageLabellingObjectDetectionComponent } from './image-labelling-object-detection/image-labelling-object-detection.component';
import { ImageLabellingProjectComponent } from './image-labelling-project/image-labelling-project.component';
import { ImageLabellingRightSidebarComponent } from './image-labelling-right-sidebar/image-labelling-right-sidebar.component';
import { ImageLabellingRoutingModule } from './image-labelling-layout-routing.module';
import { ModalModule } from 'src/shared/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { ImageLabellingSegmentationComponent } from './image-labelling-segmentation/image-labelling-segmentation.component';

@NgModule({
    imports: [CommonModule, SharedModule, ImageLabellingRoutingModule, ModalModule],
    declarations: [
        ImageLabellingLayoutComponent,
        ImageLabellingInfoComponent,
        ImageLabellingLeftSidebarComponent,
        ImageLabellingProjectComponent,
        ImageLabellingRightSidebarComponent,
        ImageLabellingFooterComponent,
        ImageLabellingObjectDetectionComponent,
        ImageLabellingSegmentationComponent,
    ],
})
export class ImageLabellingLayoutModule {}
