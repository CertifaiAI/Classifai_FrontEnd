import { VideoTimelineComponent } from './video-timeline.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const videoTimelineRoutes: Routes = [
    {
        path: '',
        component: VideoTimelineComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(videoTimelineRoutes)],
})
export class VideoTimelineRoutingModule {}
