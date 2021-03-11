import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';
import { ImageProps } from '../image-labelling.model';

@Component({
    selector: 'image-labelling-footer',
    templateUrl: './image-labelling-footer.component.html',
    styleUrls: ['./image-labelling-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingFooterComponent implements OnInit, OnChanges {
    @Input() _thumbnailInfo!: ImageProps;
    @Input() _imgSrc: string = '';
    thumbnailSize: string = '';
    thumbnailType: string = '';
    jsonSchema!: IconSchema;
    constructor() {}

    ngOnInit(): void {
        // this.thumbnailType = this._thumbnailInfo ? atob(this._thumbnailInfo.img_src) : '';
        this.jsonSchema = {
            logosCenter: [
                {
                    imgPath: `../../../assets/icons/content_copy_white_24dp.svg`,
                    hoverLabel: `Copy`,
                    alt: `Copy`,
                    onClick: () => {},
                },
            ],
        };
    }

    /**
     * @function responsible for returning file size
     * @param bytes is the length of your file size in base64
     * @param decimals is how many decimal points you wanted to have
     */
    formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (changes._thumbnailInfo && changes._imgSrc) {
            const { currentValue }: { currentValue: ImageProps } = changes._thumbnailInfo;
            const { currentValue: imgSrcVal }: { currentValue: string } = changes._imgSrc;
            this._thumbnailInfo = { ...this._thumbnailInfo, ...currentValue };
            this.thumbnailSize = this.formatBytes(imgSrcVal.length);

            const mime = imgSrcVal.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (mime && mime.length) {
                const mimeType = mime[1].split('/')[1];
                this.thumbnailType = mimeType;
            }
        }
    }
}
