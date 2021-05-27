/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

/** @pipe responsibe for saniziting SVG to allow Angular to treat it as a trusty element to render into DOM */
@Pipe({ name: 'safe' })
export class SanitizeSvgPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform = (html: string) => {
        console.log(html);
        return this.sanitizer.bypassSecurityTrustHtml(html);
    };
}
