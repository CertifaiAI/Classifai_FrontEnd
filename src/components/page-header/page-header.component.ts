import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImgLabelProps } from '../image-labelling/image-labelling.model';
import { Router } from '@angular/router';
import { LanguageService } from 'src/shared/services/language.service';

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

    constructor(private _router: Router, private _languageService: LanguageService) {
        const { url } = _router;
        this.bindImagePath(url);
        const langsArr: string[] = ['data-set-page-en', 'data-set-page-cn', 'data-set-page-ms'];
        this._languageService.initializeLanguage(`data-set-page`, langsArr);
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
