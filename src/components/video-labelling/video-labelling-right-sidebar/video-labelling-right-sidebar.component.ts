import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IconSchema } from '../../../shared/types/icon/icon.model';
import { VideoLabelProps, TabsProps } from '../../../shared/types/video-labelling/video-labelling.model';

@Component({
    selector: 'video-labelling-right-sidebar',
    templateUrl: './video-labelling-right-sidebar.component.html',
    styleUrls: ['./video-labelling-right-sidebar.component.scss'],
})
export class VideoLabellingRightSidebarComponent implements OnInit, OnChanges {
    jsonSchema!: IconSchema;
    iconIndex!: number;
    isFolderTabOpen: boolean = false;

    @Input() _onChange!: VideoLabelProps;
    @Output() _onClick: EventEmitter<TabsProps> = new EventEmitter();
    @Output() _onExport = new EventEmitter();
    @Output() _onReload = new EventEmitter();

    ngOnInit(): void {
        this.bindImagePath();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.bindImagePath();
    }

    bindImagePath = () => {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `assets/icons/folder.svg`,
                    hoverLabel: `rightSideBar.folderOrFiles`,
                    alt: `Folder`,
                    onClick: () => {
                        this._onClick.emit({ name: 'labellingProject.project', closed: false });
                    },
                },
                {
                    imgPath: `assets/icons/tag.svg`,
                    hoverLabel: `rightSideBar.label`,
                    alt: `Label`,
                    onClick: () => this._onClick.emit({ name: 'labellingProject.label', closed: false }),
                },
                {
                    imgPath: `assets/icons/bounding_box.svg`,
                    hoverLabel: `rightSideBar.annotation`,
                    alt: `Annotation`,
                    onClick: () => this._onClick.emit({ name: 'labellingProject.annotation', closed: false }),
                },
                {
                    imgPath: `assets/icons/statistic.svg`,
                    hoverLabel: `rightSideBar.statistic`,
                    alt: `Statistic`,
                    onClick: () => null,
                },
                {
                    imgPath: `assets/icons/export.svg`,
                    hoverLabel: `rightSideBar.export`,
                    alt: `Export`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => {
                        this._onExport.emit();
                    },
                },
                {
                    imgPath: `assets/icons/reload.svg`,
                    hoverLabel: `rightSideBar.reload`,
                    alt: `Reload`,
                    style: 'padding: 1.5vh 0.5vw;',
                    onClick: () => {
                        this._onReload.emit();
                    },
                },
            ],
        };
    };

    conditionalIconTheme = (): string => 'utility-icon-light';
}
