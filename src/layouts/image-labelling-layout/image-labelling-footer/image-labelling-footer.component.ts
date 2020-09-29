import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Props, ThumbnailMetadataProps } from '../image-labelling-layout.model';

type ThumbnailProps = {
    img_src: string;
} & ThumbnailMetadataProps;

@Component({
    selector: 'image-labelling-footer',
    templateUrl: './image-labelling-footer.component.html',
    styleUrls: ['./image-labelling-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabellingFooterComponent implements OnInit, OnChanges {
    @Input() _thumbnailInfo!: ThumbnailProps;
    thumbnailSize: string = '';
    thumbnailType: string = '';
    constructor() {}

    ngOnInit() {
        // this.thumbnailType = this._thumbnailInfo ? atob(this._thumbnailInfo.img_src) : '';
    }

    /**
     * @function responsible for returning file size
     * @param bytes is the length of your file size in base64
     * @param decimals is how many decimal points you wanted to have
     */
    formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes._thumbnailInfo) {
            const { currentValue }: { currentValue: Props<ThumbnailProps> } = changes._thumbnailInfo;
            this._thumbnailInfo = { ...this._thumbnailInfo, ...currentValue };
            if (this._thumbnailInfo?.img_src) {
                const { img_src } = this._thumbnailInfo;
                this.thumbnailSize = this.formatBytes(img_src.length);

                const mime = this._thumbnailInfo.img_src.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
                if (mime && mime.length) {
                    const mimeType = mime[1].split('/')[1];
                    this.thumbnailType = mimeType;
                }
            }
        }
    }
}
