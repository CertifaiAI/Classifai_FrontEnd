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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImgLabelProps } from '../image-labelling/image-labelling.model';
import { Router } from '@angular/router';

type HeaderLabelSchema = {
    name: string;
    url: string;
};

@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent implements OnInit {
    @Input() _onChange!: ImgLabelProps;
    // @Output() _navigate: EventEmitter<UrlProps> = new EventEmitter();
    logoSrc: string = `../../../assets/icons/classifai_logo_white.svg`;
    jsonSchema!: IconSchema;
    headerLabels: HeaderLabelSchema[] = [
        {
            name: 'pageHeader.home',
            url: '/',
        },
        {
            name: 'pageHeader.datasetManagement',
            url: '/dataset',
        },
        {
            name: 'pageHeader.revision',
            url: '/',
        },
    ];

    constructor(private _router: Router) {
        const { url } = _router;
        this.bindImagePath(url);
    }

    bindImagePath = (url: string) => {
        this.jsonSchema = {
            logos:
                url === '/imglabel'
                    ? [
                          {
                              imgPath: `../../../assets/icons/add_user.svg`,
                              hoverLabel: `Add user to project`,
                              alt: `pageHeader.addUser`,
                              onClick: () => null,
                          },
                          // {
                          //     imgPath: `../../../assets/icons/workspaces.svg`,
                          //     hoverLabel: `Workspaces`,
                          //     alt: `Workspaces`,
                          // },
                          // {
                          //     imgPath: `../../../assets/icons/upload.svg`,
                          //     hoverLabel: `Share / Upload`,
                          //     alt: `Upload`,
                          // },
                      ]
                    : [
                          {
                              imgPath: `../../../assets/icons/profile.svg`,
                              hoverLabel: `pageHeader.profile`,
                              alt: `Profile`,
                              onClick: () => null,
                          },
                      ],
        };
    };

    ngOnInit(): void {}
}
