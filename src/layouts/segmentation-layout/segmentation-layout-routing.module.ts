import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SegmentationLayoutComponent } from './segmentation-layout.component';

const segmentationRoutes: Routes = [
    {
        path: '',
        component: SegmentationLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(segmentationRoutes)],
})
export class SegmentationRoutingModule {}
