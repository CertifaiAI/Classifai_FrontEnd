import { CommonModule } from '@angular/common';
import { ImageLabellingFooterComponent } from './image-labelling-footer/image-labelling-footer.component';
import { ImageLabellingHeaderComponent } from './image-labelling-header/image-labelling-header.component';
import { ImageLabellingImageComponent } from './image-labelling-image/image-labelling-image.component';
import { ImageLabellingInfoComponent } from './image-labelling-info/image-labelling-info.component';
import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
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
    ImageLabellingHeaderComponent,
    ImageLabellingInfoComponent,
    ImageLabellingLeftSidebarComponent,
    ImageLabellingImageComponent,
    ImageLabellingProjectComponent,
    ImageLabellingRightSidebarComponent,
    // ImageLabellingLabelComponent,
    ImageLabellingFooterComponent,
    // ImageLabellingBoxComponent,
  ],
})
export class ImageLabellingLayoutModule {}
