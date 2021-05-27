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

import { HomeLayoutComponent } from 'src/layouts/home-layout/home-layout.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { RouterModule, Routes } from '@angular/router';
import { ServerErrorComponent } from '../server-error/server-error.component';

const routes: Routes = [
    { path: '', component: HomeLayoutComponent },
    {
        path: 'dataset',
        loadChildren: () =>
            import('../../layouts/data-set-layout/data-set-layout.module').then(
                ({ DataSetLayoutModule }) => DataSetLayoutModule,
            ),
    },
    {
        path: 'imglabel/bndbox',
        loadChildren: () =>
            import('../../layouts/image-labelling-layout/image-labelling-layout.module').then(
                ({ ImageLabellingLayoutModule }) => ImageLabellingLayoutModule,
            ),
    },
    {
        path: 'imglabel/seg',
        loadChildren: () =>
            import('../../layouts/image-labelling-layout/image-labelling-layout.module').then(
                ({ ImageLabellingLayoutModule }) => ImageLabellingLayoutModule,
            ),
    },
    { path: '500', component: ServerErrorComponent },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
