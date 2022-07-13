/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VideoProps } from 'shared/types/labelling-type/video-labelling.model';
import { IconSchema } from 'shared/types/icon/icon.model';

@Component({
    selector: 'video-labelling-footer',
    templateUrl: './video-labelling-footer.component.html',
    styleUrls: ['./video-labelling-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoLabellingFooterComponent implements OnChanges {
    @Input() _thumbnailInfo!: VideoProps;
    @Input() _imgSrc: string = '';
    thumbnailSize: string = '';
    thumbnailType: string = '';
    jsonSchema!: IconSchema;

    copyMessage(path: string) {
        const el = document.createElement('textarea');
        el.value = path;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
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
        if (changes._thumbnailInfo && changes._imgSrc) {
            const { currentValue }: { currentValue: VideoProps } = changes._thumbnailInfo;
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
