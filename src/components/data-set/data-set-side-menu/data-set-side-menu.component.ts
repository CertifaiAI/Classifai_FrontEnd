import { Component, EventEmitter, OnInit, Output } from '@angular/core';

type MenuSchema = {
    src: string;
    id: string;
    name: string;
    style?: string;
};
@Component({
    selector: 'data-set-side-menu',
    templateUrl: './data-set-side-menu.component.html',
    styleUrls: ['./data-set-side-menu.component.scss'],
})
export class DataSetSideMenuComponent implements OnInit {
    menuSchema: MenuSchema[] = [
        {
            src: 'assets/icons/add.svg',
            id: 'newProject',
            name: 'menuName.newProject',
        },
        {
            src: 'assets/icons/import.svg',
            id: 'importProject',
            name: 'menuName.importProject',
            style: 'width: 1.3vw; padding: 0.3vw;',
        },
        {
            src: 'assets/icons/project.svg',
            id: 'myProject',
            name: 'menuName.myProject',
        },
        {
            src: 'assets/icons/starred.svg',
            id: 'starred',
            name: 'menuName.starred',
        },
        {
            src: 'assets/icons/history.svg',
            id: 'recent',
            name: 'menuName.recent',
        },
        {
            src: 'assets/icons/trash.svg',
            id: 'trash',
            name: 'menuName.trash',
        },
    ];
    @Output() _onCreate: EventEmitter<boolean> = new EventEmitter();
    @Output() _onImport = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    displayModal = (): void => {
        this._onCreate.emit(true);
    };

    onClickButton = (id: string): void => {
        id === 'importProject' ? this._onImport.emit() : console.log('This feature is not available yet');
    };
}
