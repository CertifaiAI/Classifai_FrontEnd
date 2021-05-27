import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VideoTimelineComponent } from './video-timeline.component';

@NgModule({
    imports: [CommonModule],
    declarations: [VideoTimelineComponent],
    exports: [VideoTimelineComponent],
})
export class VideoTimelineModule {}
