import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HomeLayoutModule } from 'src/layouts/home-layout/home-layout.module';
import { HttpClientModule } from '@angular/common/http';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { LanguageService } from 'src/shared/services/language.service';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SharedModule } from 'src/shared/shared.module';

import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';

@NgModule({
    declarations: [AppComponent, InternalServerErrorComponent, PageNotFoundComponent],
    imports: [BrowserModule, CommonModule, AppRoutingModule, SharedModule, HttpClientModule, HomeLayoutModule],
    providers: [LanguageService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
    bootstrap: [AppComponent],
})
export class AppModule {}
