import { Component, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';

@Component({
    selector: 'video-labelling-right-sidebar',
    templateUrl: './video-labelling-right-sidebar.component.html',
    styleUrls: ['./video-labelling-right-sidebar.component.scss'],
})
export class VideoLabellingRightSidebarComponent implements OnInit {
    jsonSchema: IconSchema;
    iconIndex!: number;

    constructor() {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/folder.svg`,
                    hoverLabel: `rightSideBar.folderOrFiles`,
                    alt: `Folder`,
                    // inputType: 'file',
                    // accept: 'image/x-png,image/jpeg',
                    // onUpload: () => this._onClick.emit(),
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/export.svg`,
                    hoverLabel: `rightSideBar.export`,
                    alt: `Export`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/reload.svg`,
                    hoverLabel: `rightSideBar.reload`,
                    alt: `Reload`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => null,
                },
            ],
        };
    }

    ngOnInit() {}

    conditionalIconTheme = (): string => 'utility-icon-light';
}
