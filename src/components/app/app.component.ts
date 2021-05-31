/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';
import { remote } from 'electron';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    favIcon: HTMLLinkElement = document.querySelector('#favIcon') as HTMLLinkElement;
    lightIcon: string = `assets/classifai_dark.ico`;
    win = remote.getCurrentWindow();

    constructor() {
        this.favIcon.href = this.lightIcon;
    }
    ngOnInit(): void {}

    minWindow() {
        this.win.minimize();
    }

    maxWindow() {
        process.platform === 'darwin' ? this.win.setFullScreen(true) : this.win.maximize();
    }

    restoreWindow() {
        process.platform === 'darwin' ? this.win.setFullScreen(false) : this.win.unmaximize();
    }

    closeWindow() {
        this.win.close();
    }
}
