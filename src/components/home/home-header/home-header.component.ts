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

import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { LanguageService } from 'src/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'home-header',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss'],
})
export class HomeHeaderComponent implements OnInit {
    languageArr: (string | null)[] = [];
    headerImage: string = `../../assets/landing-page/Classifai_PoweredBy_Horizontal_light.png`;
    @ViewChildren('languages') languages!: QueryList<ElementRef>;

    constructor(public _translate: TranslateService, private _languageService: LanguageService) {
        const langsArr: string[] = ['landing-page-en', 'landing-page-cn', 'landing-page-ms'];
        this._languageService.initializeLanguage(`landing-page`, langsArr);

        this.languageArr = this._languageService.filterLanguageList(langsArr, 'landing-page');
    }

    ngOnInit() {}

    setLanguage(language: string) {
        try {
            language
                ? (this._languageService.setLanguageState(language), this._translate.use(language))
                : this._languageService.setLanguageState('en');
        } catch (err) {
            console.log('setLanguage(language: string) ----> ', err.name + ': ', err.message);
        }
    }

    showLangOpts() {
        this.languages.forEach((div: ElementRef, index) => {
            div.nativeElement.style.visibility = 'visible';
            div.nativeElement.style.opacity = '100%';
            div.nativeElement.style.left = (-(112 * (index + 1))).toString() + '%';
            div.nativeElement.style.transition = (0.15 * (1 + index)).toString() + 's';
        });
    }

    hideLangOpts() {
        this.languages.forEach((div: ElementRef, index) => {
            div.nativeElement.style.visibility = 'hidden';
            div.nativeElement.style.opacity = '0%';
            div.nativeElement.style.left = '0%';
            div.nativeElement.style.transition = (0.15 * (3 - index)).toString() + 's';
        });
    }
}
