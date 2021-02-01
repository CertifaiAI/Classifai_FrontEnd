import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'data-set-header',
    templateUrl: './data-set-header.component.html',
    styleUrls: ['./data-set-header.component.scss'],
})
export class DataSetHeaderComponent implements OnInit {
    // optionLists: string[] = ['status', 'name', 'date', 'starred'];
    // jsonSchema!: IconSchema;

    constructor() {
        // this.jsonSchema = {
        //     icons: [
        //         {
        //             imgPath: `../../../assets/icons/list_view.svg`,
        //             hoverLabel: `Toggle List View`,
        //             alt: `List`,
        //         },
        //         {
        //             imgPath: `../../../assets/icons/starred.svg`,
        //             hoverLabel: `Filter Starred`,
        //             alt: `Starred`,
        //         },
        //         {
        //             imgPath: `../../../assets/icons/more.svg`,
        //             hoverLabel: `Extra Filter`,
        //             alt: `More`,
        //         },
        //     ],
        // };
    }

    ngOnInit(): void {}

    // onSelect = (value: string) => {
    //     console.log(value);
    // };
}
