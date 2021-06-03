import { Component, OnInit } from '@angular/core';
import { IconSchema } from 'src/shared/types/icon/icon.model';

@Component({
    selector: 'video-labelling-left-sidebar',
    templateUrl: './video-labelling-left-sidebar.component.html',
    styleUrls: ['./video-labelling-left-sidebar.component.scss'],
})
export class VideoLabellingLeftSidebarComponent implements OnInit {
    jsonSchema: IconSchema;
    iconIndex!: number;

    constructor() {
        this.jsonSchema = {
            logos: [
                {
                    imgPath: `../../../assets/icons/separator.svg`,
                    hoverLabel: ``,
                    alt: ``,
                    nonClickable: true,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/pointer.svg`,
                    hoverLabel: 'leftSideBar.pointer',
                    alt: `Pointer`,
                    toggleable: true,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/rec_bounding_box.svg`,
                    hoverLabel: `leftSideBar.rectangularBB`,
                    alt: `RectangularBB`,
                    toggleable: true,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/eraser.svg`,
                    hoverLabel: `leftSideBar.eraser`,
                    alt: `Eraser`,
                    toggleable: false,
                    onClick: () => null,
                },
                {
                    imgPath: `../../../assets/icons/fit_center.svg`,
                    hoverLabel: `leftSideBar.fitCenter`,
                    alt: `Fit Center`,
                    toggleable: false,
                    onClick: () => null,
                },
            ],
        };
    }

    ngOnInit() {}

    getIndex = (index: number): void => {
        this.iconIndex = index;
    };

    conditionalIconTheme = (isPlainIcon: boolean): string => (isPlainIcon ? `plain-icon` : `utility-icon-light`);

    conditionalActiveIcon = (index: number): object | null =>
        index === this.iconIndex ? { background: 'rgb(59 59 59)' } : null;
}
