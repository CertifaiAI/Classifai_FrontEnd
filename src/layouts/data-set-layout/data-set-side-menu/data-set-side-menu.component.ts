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
            src: '../../../assets/icons/add.png',
            name: 'New Project',
        },
        {
            src: '../../../assets/icons/project.svg',
            name: 'My Project',
        },
        {
            src: '../../../assets/icons/starred.svg',
            name: 'Starred',
        },
        {
            src: '../../../assets/icons/history.svg',
            name: 'Recent',
        },
        {
            src: '../../../assets/icons/trash.svg',
            name: 'Trash',
        },
    ];
    @Output() _onClick: EventEmitter<boolean> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    displayModal = (): void => {
        this._onClick.emit(true);
    };
}
