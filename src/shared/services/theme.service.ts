/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

// import { BehaviorSubject } from 'rxjs';
// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class ThemeService {
//     /** @state mainly used for set state */
//     private themeSubject = new BehaviorSubject<string>('');

//     // /** @state mainly used for get state */
//     // theme$ = this.themeSubject.asObservable();

//     constructor() {}

//     setThemeState = (): void => {
//         const themeChecking = window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark-theme' : 'light-theme';
//         // console.log(changedLangString);
//         this.themeSubject.next(themeChecking);
//         localStorage.setItem('theme', themeChecking);
//     };

//     getThemeState = (): string => {
//         const theme = localStorage.getItem('theme');

//         /** @return {string} getValue() is used due to not an async request */
//         const themeResult = theme ? theme : this.themeSubject.getValue();
//         return themeResult ?? (this.setThemeState(), this.themeSubject.getValue());
//     };
// }
