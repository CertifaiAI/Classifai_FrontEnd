/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    favIcon: HTMLLinkElement = document.querySelector('#favIcon') as HTMLLinkElement;
    icon: string = `assets/classifai_dark.ico`;

    constructor() {
        this.favIcon.href = this.icon;
    }
}
