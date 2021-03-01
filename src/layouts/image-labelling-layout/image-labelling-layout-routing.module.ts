import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const imageLabellingLayoutRoutes: Routes = [
    {
        path: '',
        component: ImageLabellingLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(imageLabellingLayoutRoutes)],
})
export class ImageLabellingLayoutRoutingModule {}
