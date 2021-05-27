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
