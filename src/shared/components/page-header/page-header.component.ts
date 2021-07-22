/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IconSchema } from 'shared/types/icon/icon.model';
import { ImgLabelProps } from 'shared/types/image-labelling/image-labelling.model';

type HeaderLabelSchema = {
    name: string;
    url: string;
    disable: boolean;
};

@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
    @Input() _onChange!: ImgLabelProps;
    // @Output() _navigate: EventEmitter<UrlProps> = new EventEmitter();
    logoSrc: string = `assets/icons/classifai_logo_white.svg`;
    jsonSchema!: IconSchema;
    headerLabels: HeaderLabelSchema[] = [
        {
            name: 'pageHeader.home',
            url: '/',
            disable: false,
        },
        // {
        //     name: 'pageHeader.datasetManagement',
        //     url: '/dataset',
        //     disable: false,
        // },
        // {
        //     name: 'pageHeader.revision',
        //     url: '/',
        //     disable: true,
        // },
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
                              imgPath: `assets/icons/add_user.svg`,
                              hoverLabel: `Add user to project`,
                              alt: `pageHeader.addUser`,
                              onClick: () => null,
                          },
                          // {
                          //     imgPath: `assets/icons/workspaces.svg`,
                          //     hoverLabel: `Workspaces`,
                          //     alt: `Workspaces`,
                          // },
                          // {
                          //     imgPath: `assets/icons/upload.svg`,
                          //     hoverLabel: `Share / Upload`,
                          //     alt: `Upload`,
                          // },
                      ]
                    : [
                          {
                              imgPath: `assets/icons/profile.svg`,
                              hoverLabel: `pageHeader.profile`,
                              alt: `Profile`,
                              onClick: () => null,
                          },
                      ],
        };
    };
}
