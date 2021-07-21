/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import * as fileSaver from 'file-saver';

type ImageList = string[];
type UnsupportedImageTextFile = {
    content: string;
    filename: string;
    type: 'text/plain;charset=utf-8';
};

@Injectable({
    providedIn: 'root',
})
export class UnsupportedImageService {
    async downloadUnsupportedImageList(projectName: string, imageList: ImageList) {
        const content = imageList.join('\n');
        const filename = `${projectName}_unsupported_images.txt`;
        this.saveFile({ content, filename, type: 'text/plain;charset=utf-8' });

        return imageList.length;
    }

    private saveFile({ content, filename, type }: UnsupportedImageTextFile) {
        const blob = new Blob([content], { type });
        fileSaver.saveAs(blob, filename);
    }
}
