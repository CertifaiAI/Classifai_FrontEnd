import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    favIcon: HTMLLinkElement = document.querySelector('#favIcon') as HTMLLinkElement;
    lightIcon: string = `../assets/classifai_dark.ico`;

    constructor() {
        this.favIcon.href = this.lightIcon;
    }
    ngOnInit(): void {}
}
