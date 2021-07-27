/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'shared/components/toastr/toastr.module';
import { CacheBustingInterceptor } from './interceptors/cache-busting.interceptor';
import { FileNamePipe } from './pipe/file-name.pipe';
import { FormatLanguagePipe } from './pipe/format-language.pipe';
import { LanguageService } from './services/language.service';
import { LazyLoadImgDirective } from './directives/lazy-image.directive';
import { LoadingSpinnerInterceptor } from './interceptors/loading-spinner.interceptor';
import { ModalModule } from 'shared/components/modal/modal.module';
import { PageHeaderModule } from 'shared/components/page-header/page-header.module';
import { SpinnerModule } from 'shared/components/spinner/spinner.module';
import { UnsupportedImageModalModule } from 'shared/components/unsupported-image-modal/unsupported-image-modal.module';
import { EmptyContainerModule } from './components/empty-container/empty-container.module';
import { SafeUrlPipe } from './pipe/safe-resources-url.pipe';

// AoT requires an exported function for factories
export const httpLoaderFactory = (httpClient: HttpClient) => {
    return new TranslateHttpLoader(httpClient, `assets/i18n/`, `.json`);
};
@NgModule({
    declarations: [
        FormatLanguagePipe,
        FileNamePipe,
        // SanitizeSvgPipe,
        LazyLoadImgDirective,
        SafeUrlPipe,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        UnsupportedImageModalModule,
        SpinnerModule,
        ToastrModule,
        PageHeaderModule,
        EmptyContainerModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    exports: [
        FormatLanguagePipe,
        FileNamePipe,
        // SanitizeSvgPipe,
        ModalModule,
        UnsupportedImageModalModule,
        SpinnerModule,
        ToastrModule,
        PageHeaderModule,
        EmptyContainerModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        LazyLoadImgDirective,
        SafeUrlPipe,
    ],
    providers: [
        LanguageService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CacheBustingInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingSpinnerInterceptor,
            multi: true,
        },
    ],
})
export class SharedModule {}
