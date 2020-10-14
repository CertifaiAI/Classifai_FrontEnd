import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'server-error',
    templateUrl: './server-error.component.html',
    styleUrls: ['./server-error.component.scss'],
})
export class ServerErrorComponent implements OnInit {
    public errorMessage: string = 'Server Probably is Down, Please Contact Administrator!';
    constructor() {}

    ngOnInit(): void {}
}
