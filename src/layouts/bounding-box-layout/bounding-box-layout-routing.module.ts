import { BoundingBoxLayoutComponent } from './bounding-box-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const boundingboxRoutes: Routes = [
    {
        path: '',
        component: BoundingBoxLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(boundingboxRoutes)],
})
export class BoundingBoxRoutingModule {}
