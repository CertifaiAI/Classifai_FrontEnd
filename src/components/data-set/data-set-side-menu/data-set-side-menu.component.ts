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
            src: '../../../assets/icons/add.svg',
            name: 'menuName.newProject',
        },
        {
            src: '../../../assets/icons/project.svg',
            name: 'menuName.myProject',
        },
        {
            src: '../../../assets/icons/starred.svg',
            name: 'menuName.starred',
        },
        {
            src: '../../../assets/icons/history.svg',
            name: 'menuName.recent',
        },
        {
            src: '../../../assets/icons/trash.svg',
            name: 'menuName.trash',
        },
    ];
    @Output() _onClick: EventEmitter<boolean> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    displayModal = (): void => {
        this._onClick.emit(true);
    };
}
