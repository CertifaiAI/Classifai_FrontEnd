/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { TabularLabellingLayoutComponent } from './tabular-labelling-layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const tabularLabellingLayoutRoutes: Routes = [
    {
        path: '',
        component: TabularLabellingLayoutComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(tabularLabellingLayoutRoutes)],
})
export class TabularLabellingLayoutRoutingModule {}
