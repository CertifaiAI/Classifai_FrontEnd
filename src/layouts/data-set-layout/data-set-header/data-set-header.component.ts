import { Component, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/type-casting/icon/icon.model';

@Component({
    selector: 'data-set-header',
    templateUrl: './data-set-header.component.html',
    styleUrls: ['./data-set-header.component.scss'],
})
export class DataSetHeaderComponent implements OnInit {
    optionLists: string[] = ['status', 'name', 'date'];
    jsonSchema!: IconSchema;

    constructor() {
        this.jsonSchema = {
            icons: [
                {
                    imgPath: `../../../assets/icons/list_view.png`,
                    hoverLabel: `Toggle List View`,
                    alt: `List`,
                },
                {
                    imgPath: `../../../assets/icons/starred.png`,
                    hoverLabel: `Filter Starred`,
                    alt: `Starred`,
                },
                // {
                //     imgPath: `../../../assets/icons/more.png`,
                //     hoverLabel: `Extra Filter`,
                //     alt: `More`,
                // },
            ],
        };
    }

    ngOnInit(): void {}

    onSelect = (value: string) => {
        console.log(value);
    };
}
