import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconSchema, Props } from '../../layouts/image-labelling-layout/image-labelling-layout.model';

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
    @Input() _onChange!: Props;
    // @Output() _navigate: EventEmitter<UrlProps> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    logoSrc: string = `../../../assets/classifai-image-labelling-layout/Classifai_Favicon_Dark_512px.png`;
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
                    imgPath: `${this.imgRelativePath}light-theme/add_user.png`,
                    hoverLabel: `Add user to project`,
                    alt: `Add user`,
                },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/workspaces.png`,
                //   hoverLabel: `Workspaces`,
                //   alt: `Workspaces`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}light-theme/upload.png`,
                //   hoverLabel: `Share / Upload`,
                //   alt: `Upload`,
                // },
            ],
        };
    };
}
