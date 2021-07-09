/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'languageSlice' })
export class FormatLanguagePipe implements PipeTransform {
    transform(lang: string): string {
        let newStr: string = '';
        switch (lang.slice(-2)) {
            case 'en':
                newStr = 'EN';
                break;

            case 'cn':
                newStr = 'CN';
                break;

            case 'ms':
                newStr = 'MS';
                break;

            default:
                break;
        }
        return newStr;
    }
}
