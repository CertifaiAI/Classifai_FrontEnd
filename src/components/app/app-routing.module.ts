/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { NgModule } from '@angular/core';
import { LoadChildren, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from 'components/page-not-found/page-not-found.component';
import { HomeLayoutComponent } from 'layouts/home-layout/home-layout.component';

const imgLabellingLayout: LoadChildren = () =>
    import('layouts/image-labelling-layout/image-labelling-layout.module').then(
        ({ ImageLabellingLayoutModule }) => ImageLabellingLayoutModule,
    );

const routes: Routes = [
    { path: '', component: HomeLayoutComponent },
    {
        path: 'dataset',
        loadChildren: () =>
            import('layouts/data-set-layout/data-set-layout.module').then(
                ({ DataSetLayoutModule }) => DataSetLayoutModule,
            ),
    },
    {
        path: 'imglabel/bndbox',
        loadChildren: imgLabellingLayout,
    },
    {
        path: 'imglabel/seg',
        loadChildren: imgLabellingLayout,
    },
    {
        path: 'videolbl/bndbox',
        loadChildren: () =>
            import('../../layouts/video-labelling-layout/video-labelling-layout.module').then(
                ({ VideoLabellingLayoutModule }) => VideoLabellingLayoutModule,
            ),
    },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
