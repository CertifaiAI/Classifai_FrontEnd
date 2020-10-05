import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.css'],
})
export class PageNotFoundComponent implements OnInit {
    public errorTitle: string = '404';
    public errorSubTitle: string = 'Page not found';
    public errorMessage: string =
        'Sorry, but the page you are looking for is not found. Please, make sure you have typed the current URL.';

    constructor() {}

    ngOnInit(): void {}
}
