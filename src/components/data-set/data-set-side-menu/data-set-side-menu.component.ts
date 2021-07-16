/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Output } from '@angular/core';

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
export class DataSetSideMenuComponent {
    selectedId: string = 'myproject';
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
            id: 'myproject',
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
        // {
        //     src: 'assets/icons/trash.svg',
        //     id: 'trash',
        //     name: 'menuName.trash',
        // },
    ];
    @Output() _onCreate: EventEmitter<boolean> = new EventEmitter();
    @Output() _onFilter: EventEmitter<string> = new EventEmitter();
    @Output() _onImport = new EventEmitter();

    displayModal = (): void => {
        this._onCreate.emit(true);
    };

    onClickButton = (id: string): void => {
        id !== 'importProject' && (this.selectedId = id);
        switch (id) {
            case 'importProject':
                this._onImport.emit();
                break;
            case 'myproject':
            case 'starred':
            case 'recent':
                this._onFilter.emit(id);
                break;
            default:
                console.log('This feature is not available yet');
        }
    };
}
