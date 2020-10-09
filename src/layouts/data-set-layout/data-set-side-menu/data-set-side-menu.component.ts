import { Component, EventEmitter, OnInit, Output } from '@angular/core';

type MenuSchema = {
    src: string;
    name: string;
};
@Component({
    selector: 'data-set-side-menu',
    templateUrl: './data-set-side-menu.component.html',
    styleUrls: ['./data-set-side-menu.component.scss'],
})
export class DataSetSideMenuComponent implements OnInit {
    menuSchema: MenuSchema[] = [
        {
            src: '../../../assets/classifai-image-labelling-layout/light-theme/add.png',
            name: 'New Project',
        },
        {
            src: '../../../assets/classifai-image-labelling-layout/light-theme/project.png',
            name: 'My Project',
        },
        {
            src: '../../../assets/classifai-image-labelling-layout/light-theme/starred.png',
            name: 'Starred',
        },
        {
            src: '../../../assets/classifai-image-labelling-layout/light-theme/history.png',
            name: 'Recent',
        },
        {
            src: '../../../assets/classifai-image-labelling-layout/light-theme/trash.png',
            name: 'Trash',
        },
    ];
    @Output() _onClick: EventEmitter<boolean> = new EventEmitter();

    constructor() {}

    ngOnInit = (): void => {};

    displayModal = (): void => {
        this._onClick.emit(true);
    };
}
