import { CommonModule } from '@angular/common';
import { ImageLabellingFooterComponent } from './image-labelling-footer/image-labelling-footer.component';
import { ImageLabellingInfoComponent } from './image-labelling-info/image-labelling-info.component';
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { ImageLabellingObjectDetectionComponent } from './image-labelling-object-detection/image-labelling-object-detection.component';
import { ImageLabellingLeftSidebarComponent } from './image-labelling-left-sidebar/image-labelling-left-sidebar.component';
import { ImageLabellingProjectComponent } from './image-labelling-project/image-labelling-project.component';
import { ImageLabellingRightSidebarComponent } from './image-labelling-right-sidebar/image-labelling-right-sidebar.component';
import { ImageLabellingRoutingModule } from './image-labelling-layout-routing.module';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
    imports: [CommonModule, SharedModule, ImageLabellingRoutingModule],
    declarations: [
        ImageLabellingLayoutComponent,
        ImageLabellingInfoComponent,
        ImageLabellingLeftSidebarComponent,
        ImageLabellingProjectComponent,
        ImageLabellingRightSidebarComponent,
        ImageLabellingFooterComponent,
        ImageLabellingObjectDetectionComponent,
    ],
})
export class ImageLabellingLayoutModule {}
