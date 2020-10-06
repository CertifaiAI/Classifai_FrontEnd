import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'data-set-header',
    templateUrl: './data-set-header.component.html',
    styleUrls: ['./data-set-header.component.scss'],
})
export class DataSetHeaderComponent implements OnInit {
    optionLists: string[] = ['status', 'name', 'date'];
    constructor() {}

    ngOnInit = (): void => {};

    onSelect = (value: string) => {
        console.log(value);
    };
}
