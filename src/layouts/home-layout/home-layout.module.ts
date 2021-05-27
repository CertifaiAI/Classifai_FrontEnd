/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule, ModalModule, RouterModule],
    declarations: [HomeLayoutComponent, HomeHeaderComponent, HomeCardComponent, HomeContentComponent],
    // providers: [TranslateService],
})
export class HomeLayoutModule {}
