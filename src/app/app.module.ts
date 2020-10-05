import { BoundingboxService } from './../shared/services/boundingbox.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HomeLayoutModule } from 'src/layouts/home-layout/home-layout.module';
import { HttpClientModule } from '@angular/common/http';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';
import { LanguageService } from 'src/shared/services/language.service';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
    declarations: [AppComponent, InternalServerErrorComponent, PageNotFoundComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        HomeLayoutModule,
    ],
    providers: [LanguageService, { provide: LocationStrategy, useClass: HashLocationStrategy }, BoundingboxService],
    bootstrap: [AppComponent],
})
export class AppModule {}
