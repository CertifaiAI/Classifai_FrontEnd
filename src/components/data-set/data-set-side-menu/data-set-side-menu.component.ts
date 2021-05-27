/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
            src: '../../../assets/icons/add.svg',
            id: 'newProject',
            name: 'menuName.newProject',
        },
        {
            src: '../../../assets/icons/import.svg',
            id: 'importProject',
            name: 'menuName.importProject',
            style: 'width: 1.3vw; padding: 0.3vw;',
        },
        {
            src: '../../../assets/icons/project.svg',
            id: 'myProject',
            name: 'menuName.myProject',
        },
        {
            src: '../../../assets/icons/starred.svg',
            id: 'starred',
            name: 'menuName.starred',
        },
        {
            src: '../../../assets/icons/history.svg',
            id: 'recent',
            name: 'menuName.recent',
        },
        {
            src: '../../../assets/icons/trash.svg',
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
