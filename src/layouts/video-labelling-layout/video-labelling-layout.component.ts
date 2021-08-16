/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, OnInit } from '@angular/core';
import {
    BboxMetadata,
    CompleteMetadata,
    PolyMetadata,
    TabsProps,
} from '../../components/video-labelling/video-labelling.modal';

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
            closed: true,
        },
        {
            name: 'label',
            closed: true,
        },
        {
            name: 'annotation',
            closed: true,
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
            bnd_box: [],
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

    onChangeMetadata = (mutatedMetadata: BboxMetadata & PolyMetadata): void => {
        console.log(mutatedMetadata);
        // this.tabStatus = this.tabStatus.map((tab) =>
        //     tab.annotation ? { ...tab, annotation: [mutatedMetadata] } : tab,
        // );
        // // whenever object-detection / segmentation adding new drawing
        // // mutate state in thumbnailList to update child comp (project comp)
        // this.thumbnailList = this.thumbnailList.map((metadata, i) => {
        //     return this.currentImageDisplayIndex === i ? mutatedMetadata : metadata;
        // });
        // // whenever object-detection / segmentation adding new drawing
        // // mutate state in onChangeSchema to update child comp (info comp)
        // const hasAnnotation = mutatedMetadata.bnd_box
        //     ? mutatedMetadata.bnd_box.length > 0
        //     : mutatedMetadata.polygons.length > 0;

        // this.onChangeSchema = {
        //     ...this.onChangeSchema,
        //     hasAnnotation,
        // };
        // this.updateProjectProgress();
    };
}
