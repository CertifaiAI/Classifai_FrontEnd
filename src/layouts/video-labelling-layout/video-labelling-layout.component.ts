/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';
import { CompleteMetadata, TabsProps } from '../../components/video-labelling/video-labelling.modal';

@Component({
    selector: 'app-video-labelling-layout',
    templateUrl: './video-labelling-layout.component.html',
    styleUrls: ['./video-labelling-layout.component.scss'],
})
export class VideoLabellingLayoutComponent implements OnInit {
    selectedMetaData?: CompleteMetadata;

    tabStatus: TabsProps[] = [
        {
            name: 'project',
            closed: false,
        },
        {
            name: 'label',
            closed: false,
        },
        {
            name: 'annotation',
            closed: false,
        },
    ];

    constructor() {
        // Mock Values from Backend
        this.selectedMetaData = {
            img_x: 0,
            img_y: 0,
            img_w: 960,
            img_h: 540,
            img_ori_h: 1920,
            img_ori_w: 1080,
            img_path: 'path',
            img_thumbnail: '',
            project_name: 'project name',
            uuid: '1234',
            bnd_box: undefined,
            img_depth: undefined,
            file_size: 12345,
            polygons: undefined,
        };
    }

    ngOnInit() {}

    onToggleTab = (tab: TabsProps) => {
        this.tabStatus.forEach((element) => {
            if (element.name === tab.name) {
                element.closed = !element.closed;
            }
        });
    };
}
