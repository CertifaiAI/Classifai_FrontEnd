/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileNameSlice' })
export class FileNamePipe implements PipeTransform {
    /**
     * @function responsible to transform the given image path to a proper filename
     * @param {string} name - props of image path
     * @return filename with extension
     */
    transform(name: string): string {
        if (name) {
            if (window.navigator.platform.startsWith('Mac') || window.navigator.platform.startsWith('Linux')) {
                return name.split('/').slice(-1)[0];
            } else {
                return name.split('\\').slice(-1)[0];
            }
        } else {
            return '';
        }
    }
}
