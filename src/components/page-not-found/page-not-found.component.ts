/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component } from '@angular/core';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent {
    public errorTitle: string = '404';
    public errorSubTitle: string = 'Page not found';
    public errorMessage: string =
        'Sorry, but the page you are looking for is not found. Please, make sure you have typed the current URL.';
}
