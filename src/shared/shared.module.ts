import { CacheBustingInterceptor } from './interceptors/cache-busting.interceptor';
import { ClassifaiModalModule } from './classifai-modal/classifai-modal.module';
import { CommonModule } from '@angular/common';
import { FileNamePipe } from './pipe/file-name.pipe';
import { FormatLanguagePipe } from './pipe/format-language.pipe';
import { FormService } from './services/form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LanguageService } from './services/language.service';
import { LazyImgDirective } from './directives/lazy-image.directive';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, `../assets/i18n/`, `.json`);
}

@NgModule({
  declarations: [FormatLanguagePipe, FileNamePipe, LazyImgDirective],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClassifaiModalModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    FormatLanguagePipe,
    FileNamePipe,
    LazyImgDirective,
    ClassifaiModalModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  providers: [
    LanguageService,
    ThemeService,
    FormService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheBustingInterceptor,
      multi: true,
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: ResponseJsonInterceptor,
    //   multi: true,
    // },
  ],
})
export class SharedModule {}
