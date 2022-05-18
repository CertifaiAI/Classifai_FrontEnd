import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AudioLabellingLayoutComponent } from './audio-labelling-layout.component';

const audioLabellingLayoutRoutes: Routes = [
    {
        path: '',
        component: AudioLabellingLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(audioLabellingLayoutRoutes)],
})
export class AudioLabellingLayoutRoutingModule {}
