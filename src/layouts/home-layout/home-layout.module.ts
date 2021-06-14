/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CommonModule } from '@angular/common';
import { HomeCardComponent } from 'src/components/home/home-card/home-card.component';
import { HomeContentComponent } from 'src/components/home/home-content/home-content.component';
import { HomeHeaderComponent } from 'src/components/home/home-header/home-header.component';
import { HomeLayoutComponent } from './home-layout.component';
import { ModalModule } from 'src/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeFooterComponent } from 'src/components/home/home-footer/home-footer.component';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule, ModalModule, RouterModule],
    declarations: [
        HomeLayoutComponent,
        HomeHeaderComponent,
        HomeCardComponent,
        HomeContentComponent,
        HomeFooterComponent,
    ],
    // providers: [TranslateService],
})
export class HomeLayoutModule {}
