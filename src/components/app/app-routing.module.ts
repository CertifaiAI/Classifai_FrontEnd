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
        path: 'imglabel/boundingbox',
        loadChildren: () =>
            import('../../layouts/bounding-box-layout/bounding-box-layout.module').then(
                ({ BoundingBoxLayoutModule }) => BoundingBoxLayoutModule,
            ),
    },
    {
        path: 'imglabel/segmentation',
        loadChildren: () =>
            import('../../layouts/segmentation-layout/segmentation-layout.module').then(
                ({ SegmentationLayoutModule }) => SegmentationLayoutModule,
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
