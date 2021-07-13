/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';
import { TabsProps } from 'src/components/video-labelling/video-labelling.modal';

@Component({
    selector: 'app-video-labelling-layout',
    templateUrl: './video-labelling-layout.component.html',
    styleUrls: ['./video-labelling-layout.component.scss'],
})
export class VideoLabellingLayoutComponent implements OnInit {
    tabStatus: TabsProps[] = [
        {
            name: 'project',
            closed: true,
        },
        {
            name: 'annotation',
            closed: true,
        },
    ];

    constructor() {}

    ngOnInit() {}

    onToggleTab = (tab: TabsProps) => {
        this.tabStatus.forEach((element) => {
            if (element.name === tab.name) {
                element.closed = !element.closed;
            }
        });
    };
}
