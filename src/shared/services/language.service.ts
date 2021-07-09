/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    /** @state mainly used for set state */
    private languageSubject = new BehaviorSubject<string>('');

    /** @state mainly used to get state */
    language$ = this.languageSubject.asObservable();

    constructor(public _translate: TranslateService) {}

    setLanguageState(language: string): void {
        const changedLangString = language.length > 2 ? language.slice(-2) : language;
        this.languageSubject.next(changedLangString);
        localStorage.setItem('language', changedLangString);
    }

    filterLanguageList = (langList: string[], compName: string): (string | null)[] => {
        return langList.map((language) => (language.startsWith(compName) ? language : null)).filter((f) => f !== null);
    };

    initializeLanguage = (compName: string, langsArr: string[]): void => {
        const mutatedLangsArr: string[] = langsArr.map((lang, i) =>
            langsArr.length === i + 1 ? `${lang}/` : `/${lang}|`,
        );
        /**
         * @method join(' ') Used for array turning into single string
         * @method replace(/ /g,'') Used for removing all white space from string
         */
        const finalizedLang: string = mutatedLangsArr.join(' ').replace(/ /g, '');
        this._translate.addLangs(langsArr);

        this.language$.pipe(first()).subscribe((language) => {
            const validateLang = language ? language : localStorage.getItem('language') || 'en';
            this.setTranslation(compName, validateLang, finalizedLang);
        });
    };

    private setTranslation = (compName: string, lang: string, finalizedLang: string): void => {
        /**
         * @constant {string} browserLang format like browserLang.match(/image-labelling-en|image-labelling-cn/)
         * which is needed by '@ngx-translate' library
         */
        const browserLang: string = this._translate.getBrowserLang();

        this._translate.use(browserLang.match(finalizedLang) ? browserLang : `${compName}-${lang}`);
    };
}
