/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { HomeCardComponent } from 'components/home/home-card/home-card.component';
import { HomeContentComponent } from 'components/home/home-content/home-content.component';
import { HomeHeaderComponent } from 'components/home/home-header/home-header.component';
import { HomeLayoutComponent } from './home-layout.component';
import { ModalModule } from 'shared/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule, ModalModule, RouterModule],
    declarations: [
        HomeLayoutComponent,
        HomeHeaderComponent,
        HomeCardComponent,
        HomeContentComponent,
    ],
    // providers: [TranslateService],
})
export class HomeLayoutModule {}
