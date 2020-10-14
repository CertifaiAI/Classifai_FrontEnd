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
            src: '../../../assets/icons/project.png',
            name: 'My Project',
        },
        {
            src: '../../../assets/icons/starred.png',
            name: 'Starred',
        },
        {
            src: '../../../assets/icons/history.png',
            name: 'Recent',
        },
        {
            src: '../../../assets/icons/trash.png',
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
