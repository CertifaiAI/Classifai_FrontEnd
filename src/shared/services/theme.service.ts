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
