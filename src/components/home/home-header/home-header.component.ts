/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'shared/services/language.service';

@Component({
    selector: 'home-header',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss'],
})
export class HomeHeaderComponent {
    languageArr: (string | null)[] = [];
    // headerImage: string = `assets/landing-page/Classifai_PoweredBy_Horizontal_light.png`;
    headerImage: string = `assets/landing-page/Classifai_Community_Logo.png`;
    @ViewChildren('languages') languages!: QueryList<ElementRef>;

    constructor(public _translate: TranslateService, private _languageService: LanguageService) {
        const langsArr: string[] = ['landing-page-en', 'landing-page-cn', 'landing-page-ms'];
        this._languageService.initializeLanguage(`landing-page`, langsArr);

        this.languageArr = this._languageService.filterLanguageList(langsArr, 'landing-page');
    }

    setLanguage(language: string) {
        try {
            language ? this.useLanguageTranslation(language) : this._languageService.setLanguageState('en');
        } catch (err) {
            console.log('setLanguage(language: string) ----> ', err.name + ': ', err.message);
        }
    }

    useLanguageTranslation(language: string) {
        this._languageService.setLanguageState(language);
        this._translate.use(language);
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
