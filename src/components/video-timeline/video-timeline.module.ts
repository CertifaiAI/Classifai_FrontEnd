import { VideoTimelineRoutingModule } from './video-timeline-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VideoTimelineComponent } from './video-timeline.component';

@NgModule({
    imports: [CommonModule, VideoTimelineRoutingModule],
    declarations: [VideoTimelineComponent],
    exports: [VideoTimelineComponent],
})
export class VideoTimelineModule {}
