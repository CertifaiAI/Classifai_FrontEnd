/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
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
