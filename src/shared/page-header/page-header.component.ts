import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class PageHeaderComponent implements OnInit, OnChanges {
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

    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

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

    // emitParentUrl = <T extends UrlProps>({ url }: T): void => {
    //     url ? this._navigate.emit({ url }) : null;
    // };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        const { theme } = changes._onChange.currentValue;
        // console.log(currentValue);
        this._onChange.theme = theme;
        this.bindImagePath();
    }

    conditionalIconTheme = (): string =>
        this._onChange.theme === 'light' ? 'utility-icon-light' : 'utility-icon-dark';
}
