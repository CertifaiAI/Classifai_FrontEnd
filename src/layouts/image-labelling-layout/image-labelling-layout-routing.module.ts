import { ImageLabellingLayoutComponent } from './image-labelling-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const imageLabellingRoutes: Routes = [
    {
        path: '',
        component: ImageLabellingLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(imageLabellingRoutes)],
})
export class ImageLabellingRoutingModule {}
