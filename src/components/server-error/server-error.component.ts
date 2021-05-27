/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'server-error',
    templateUrl: './server-error.component.html',
    styleUrls: ['./server-error.component.scss'],
})
export class ServerErrorComponent implements OnInit {
    public errorMessage: string = 'Server Probably is Down, Please Contact Administrator!';
    constructor() {}

    ngOnInit(): void {}
}
