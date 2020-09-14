import { EvenEmitterUrlProps, IimageLabellingSchema, Props } from '../image-labelling-layout.model';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
    ChangeDetectionStrategy,
} from '@angular/core';

@Component({
    selector: 'image-labelling-header',
    templateUrl: './image-labelling-header.component.html',
    styleUrls: ['./image-labelling-header.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingHeaderComponent implements OnInit, OnChanges {
    // @Input() _theme: string;
    @Input() _onChange!: Props;
    @Output() _navigate: EventEmitter<EvenEmitterUrlProps> = new EventEmitter();
    imgRelativePath: string = `../../../assets/classifai-image-labelling-layout/`;
    logoSrc: string = `../../../assets/classifai-image-labelling-layout/Classifai_Favicon_Dark_512px.png`;
    jsonSchema!: IimageLabellingSchema;

    constructor() {}

    ngOnInit(): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `${this.imgRelativePath}${this._onChange.theme}/add_user.png`,
                    hoverLabel: `Add user to project`,
                    alt: `Add user`,
                },
                // {
                //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/workspaces.png`,
                //   hoverLabel: `Workspaces`,
                //   alt: `Workspaces`,
                // },
                // {
                //   imgPath: `${this.imgRelativePath}${this._onChange.theme}/upload.png`,
                //   hoverLabel: `Share / Upload`,
                //   alt: `Upload`,
                // },
            ],
        };
    };

    emitParentUrl = <T extends EvenEmitterUrlProps>({ url }: T): void => {
        url ? this._navigate.emit({ url }) : null;
    };

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
