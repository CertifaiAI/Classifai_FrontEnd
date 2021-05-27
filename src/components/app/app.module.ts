import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HomeLayoutModule } from 'src/layouts/home-layout/home-layout.module';
import { HttpClientModule } from '@angular/common/http';
import { LanguageService } from 'src/shared/services/language.service';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { ServerErrorComponent } from '../server-error/server-error.component';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
    declarations: [AppComponent, ServerErrorComponent, PageNotFoundComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        HomeLayoutModule,
    ],
    providers: [LanguageService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
    bootstrap: [AppComponent],
})
export class AppModule {}
