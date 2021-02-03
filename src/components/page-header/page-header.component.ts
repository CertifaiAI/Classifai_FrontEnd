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
            name: 'Home',
            url: '/',
        },
        {
            name: 'Dataset Management',
            url: '/dataset',
        },
        {
            name: 'Revision',
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
                              alt: `Add user`,
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
                              hoverLabel: `Profile`,
                              alt: `Profile`,
                              onClick: () => null,
                          },
                      ],
        };
    };

    ngOnInit(): void {}
}
