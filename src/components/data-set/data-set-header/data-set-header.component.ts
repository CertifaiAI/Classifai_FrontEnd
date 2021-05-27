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
