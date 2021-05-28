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
        this.win.maximize();
    }

    restoreWindow() {
        this.win.unmaximize();
    }

    closeWindow() {
        this.win.close();
    }
}
