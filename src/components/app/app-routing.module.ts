/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { LoadChildren, RouterModule, Routes } from '@angular/router';

import { HomeLayoutComponent } from 'layouts/home-layout/home-layout.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from 'components/page-not-found/page-not-found.component';

const imgLabellingLayout: LoadChildren = () =>
    import('layouts/image-labelling-layout/image-labelling-layout.module').then(
        ({ ImageLabellingLayoutModule }) => ImageLabellingLayoutModule,
    );

const audioLabellingLayout: LoadChildren = () =>
    import('layouts/audio-labelling-layout/audio-labelling-layout.module').then(
        ({ AudioLabellingLayoutModule }) => AudioLabellingLayoutModule,
    );

const tabularLabellingLayout: LoadChildren = () =>
    import('layouts/tabular-labelling-layout/tabular-labelling-layout.module').then(
        ({ TabularLabellingLayoutModule }) => TabularLabellingLayoutModule,
    );

const videoLabellingLayout: LoadChildren = () =>
    import('layouts/video-labelling-layout/video-labelling-layout.module').then(
        ({ VideoLabellingLayoutModule }) => VideoLabellingLayoutModule,
    );

const dataSetLayout: LoadChildren = () =>
    import('layouts/data-set-layout/data-set-layout.module').then(({ DataSetLayoutModule }) => DataSetLayoutModule);

const routes: Routes = [
    {
        path: '',
        component: HomeLayoutComponent,
    },
    {
        path: 'dataset',
        loadChildren: dataSetLayout,
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
        path: 'videolabel/videobndbox',
        loadChildren: videoLabellingLayout,
    },
    {
        path: 'videolabel/videoseg',
        loadChildren: videoLabellingLayout,
    },
    {
        path: 'audio',
        loadChildren: audioLabellingLayout,
    },
    {
        path: 'tabular',
        loadChildren: tabularLabellingLayout,
    },
    {
        path: '**',
        component: PageNotFoundComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
