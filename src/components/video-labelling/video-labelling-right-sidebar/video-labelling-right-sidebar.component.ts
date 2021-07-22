import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IconSchema } from '../../../shared/types/icon/icon.model';

@Component({
    selector: 'video-labelling-right-sidebar',
    templateUrl: './video-labelling-right-sidebar.component.html',
    styleUrls: ['./video-labelling-right-sidebar.component.scss'],
})
export class VideoLabellingRightSidebarComponent implements OnInit {
    jsonSchema: IconSchema;
    iconIndex!: number;

    @Output() _onClick = new EventEmitter();

    isFolderTabOpen: boolean = false;

    constructor() {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/folder.svg`,
                    hoverLabel: `rightSideBar.folderOrFiles`,
                    alt: `Folder`,
                    onClick: () => this._onClick.emit({ name: 'project', closed: false }),
                },
                {
                    imgPath: `../../../assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => this._onClick.emit({ name: 'label', closed: false }),
                },
                {
                    imgPath: `../../../assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => this._onClick.emit({ name: 'annotation', closed: false }),
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
