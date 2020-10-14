import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/type-casting/icon/icon.model';
import { ImgLabelProps } from 'src/layouts/image-labelling-layout/image-labelling-layout.model';

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
    imgRelativePath: string = `../../../assets/icons/`;
    logoSrc: string = `../../../assets/icons/classifai_logo_dark.png`;
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
            name: 'Annotation',
            url: '/imglabel',
        },
        {
            name: 'Revision',
            url: '/',
        },
    ];

    constructor() {
        this.bindImagePath();
    }

    ngOnInit(): void {}

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `${this.imgRelativePath}add_user.png`,
                    hoverLabel: `Add user to project`,
                    alt: `Add user`,
                },
                // {
                //   imgPath: `${this.imgRelativePath}workspaces.png`,
                //   hoverLabel: `Workspaces`,
                //   alt: `Workspaces`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}upload.png`,
                //   hoverLabel: `Share / Upload`,
                //   alt: `Upload`,
                // },
            ],
        };
    };
}
