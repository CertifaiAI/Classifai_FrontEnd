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
import { DataSetCardComponent } from 'src/components/data-set/data-set-card/data-set-card.component';
import { DataSetHeaderComponent } from 'src/components/data-set/data-set-header/data-set-header.component';
import { DataSetLayoutComponent } from './data-set-layout.component';
import { DataSetRoutingModule } from './data-set-layout-routing.module';
import { DataSetSideMenuComponent } from 'src/components/data-set/data-set-side-menu/data-set-side-menu.component';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
    imports: [CommonModule, SharedModule, DataSetRoutingModule],
    declarations: [DataSetLayoutComponent, DataSetSideMenuComponent, DataSetHeaderComponent, DataSetCardComponent],
})
export class DataSetLayoutModule {}
