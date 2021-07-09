/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    favIcon: HTMLLinkElement = document.querySelector('#favIcon') as HTMLLinkElement;
    lightIcon: string = `../assets/cs-icon.ico`;

    constructor() {
        this.favIcon.href = this.lightIcon;
    }
    ngOnInit(): void {}
}
