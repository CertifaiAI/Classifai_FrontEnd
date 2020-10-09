import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** @pipe responsibe for saniziting SVG to allow Angular to treat it as a trusty element to render into DOM */
@Pipe({ name: 'safe' })
export class SanitizeSvgPipe {
    constructor(private sanitizer: DomSanitizer) {}

    transform = (html: string) => {
        console.log(html);
        return this.sanitizer.bypassSecurityTrustHtml(html);
    };
}
