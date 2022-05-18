/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'shared/shared.module';
import { AudioLabellingLeftSidebarComponent } from './audio-labelling-left-sidebar/audio-labelling-left-sidebar.component';
import { AudioLabellingRightSidebarComponent } from './audio-labelling-right-sidebar/audio-labelling-right-sidebar.component';
import { AudioLabellingProjectComponent } from './audio-labelling-project/audio-labelling-project.component';
import { AudioLabellingFooterComponent } from './audio-labelling-footer/audio-labelling-footer.component';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        AudioLabellingLeftSidebarComponent,
        AudioLabellingRightSidebarComponent,
        AudioLabellingProjectComponent,
        AudioLabellingFooterComponent,
    ],
    exports: [
        AudioLabellingLeftSidebarComponent,
        AudioLabellingRightSidebarComponent,
        AudioLabellingProjectComponent,
        AudioLabellingFooterComponent,
    ],
})
export class AudioLabellingModule {}
