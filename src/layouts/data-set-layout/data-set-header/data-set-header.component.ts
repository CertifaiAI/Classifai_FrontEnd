import { Component, OnInit } from '@angular/core';
import { IconSchema } from 'src/layouts/image-labelling-layout/image-labelling-layout.model';

@Component({
    selector: 'data-set-header',
    templateUrl: './data-set-header.component.html',
    styleUrls: ['./data-set-header.component.scss'],
})
export class DataSetHeaderComponent implements OnInit {
    optionLists: string[] = ['status', 'name', 'date'];
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    jsonSchema!: IconSchema;

    constructor() {
        this.jsonSchema = {
            icons: [
                {
                    imgPath: `${this.imgRelativePath}light-theme/list_view.png`,
                    hoverLabel: `Toggle List View`,
                    alt: `List`,
                },
                {
                    imgPath: `${this.imgRelativePath}light-theme/starred.png`,
                    hoverLabel: `Filter Starred`,
                    alt: `Starred`,
                },
                // {
                //     imgPath: `${this.imgRelativePath}light-theme/more.png`,
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
