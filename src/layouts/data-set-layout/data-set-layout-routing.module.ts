/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { DataSetLayoutComponent } from './data-set-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const dataSetRoutes: Routes = [
    {
        path: '',
        component: DataSetLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(dataSetRoutes)],
})
export class DataSetRoutingModule {}
