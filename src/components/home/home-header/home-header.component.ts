/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
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
    headerImage: string = `../../assets/landing-page/AICS_v2_Output-06_dark.png`;
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
