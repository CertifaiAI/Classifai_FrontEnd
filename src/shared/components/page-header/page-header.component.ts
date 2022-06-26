import { TutorialService, TutorialState } from './../../services/tutorial.service';
/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconSchema } from 'shared/types/icon/icon.model';
import { ImgLabelProps } from 'shared/types/image-labelling/image-labelling.model';
import { ModalBodyStyle } from 'shared/types/modal/modal.model';
import { ModalService } from '../modal/modal.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

type HeaderLabelSchema = {
    name: string;
    url: string;
    disable: boolean;
};

type Tutorial = {
    imageTutorialPath: string;
    imageTutorialAlt: string;
    imageTutorialDesc: string;
};

@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent implements OnInit {
    @Input() _onChange!: ImgLabelProps;
    // @Output() _navigate: EventEmitter<UrlProps> = new EventEmitter();
    logoSrc: string = `assets/icons/classifai_logo_white.svg`;
    jsonSchema!: IconSchema;
    private unsubscribe$: Subject<any> = new Subject();
    private tutorialState!: TutorialState;
    tutorialMenuToggle: boolean = false;
    isToggle: boolean = false;
    createProjectIntro: boolean = false;
    bndBoxIntro: boolean = false;
    polygonIntro: boolean = false;
    help: string = 'pageHeader.tutorial';
    headerLabels: HeaderLabelSchema[] = [
        {
            name: 'pageHeader.home',
            url: '/',
            disable: false,
        },
        // {
        //     name: 'pageHeader.datasetManagement',
        //     url: '/dataset',
        //     disable: false,
        // },
        // {
        //     name: 'pageHeader.revision',
        //     url: '/',
        //     disable: true,
        // },
    ];

    readonly createProjectId = 'modal-create-project-tutorial';
    readonly createProjectTitle = 'How to Start a Project ?';
    readonly createProjectTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_new_project_btn.png',
            imageTutorialAlt: 'New Project Button',
            imageTutorialDesc: 'Click New Project button to start a new project.',
        },
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_project_name.png',
            imageTutorialAlt: 'Project Name',
            imageTutorialDesc: 'Enter the project name.',
        },
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_project_folder.png',
            imageTutorialAlt: 'Project Folder',
            imageTutorialDesc: 'Then, click Choose Folder button to choose data folder.',
        },
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_label_file.png',
            imageTutorialAlt: 'Label File',
            imageTutorialDesc: 'Next, click Choose File button to add label text file (optional).',
        },
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_create_project.png',
            imageTutorialAlt: 'Create Button',
            imageTutorialDesc: 'After that, click Create button to proceed the project creation.',
        },
        {
            imageTutorialPath: 'assets/tutorial/create_project/dm_project_created.png',
            imageTutorialAlt: 'Project Card',
            imageTutorialDesc:
                'Finally, the created project will show in the dataset management page. Click the project card to open the project.',
        },
    ];

    readonly drawBboxId = 'modal-draw-bbox-tutorial';
    readonly drawBboxTitle = 'How to Draw Boundingbox ?';
    readonly drawBboxTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_pointer.gif',
            imageTutorialAlt: 'How to use pointer',
            imageTutorialDesc:
                'Click the pointer tool for moving the image and zoom in and out image using mouse scroll wheel.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_annotation_tool.png',
            imageTutorialAlt: 'Annotation tool',
            imageTutorialDesc: 'Click annotation tool to annotate image.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_draw.gif',
            imageTutorialAlt: 'Draw bounding box',
            imageTutorialDesc: 'Click and drag to draw a bounding box around an object.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_adjust.gif',
            imageTutorialAlt: 'Adjust bounding box',
            imageTutorialDesc: 'Click and drag to adjust the size of bounding box around an object.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_select_label.png',
            imageTutorialAlt: 'Select label',
            imageTutorialDesc: 'Select the label for the object from the label list.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_select_bbox.gif',
            imageTutorialAlt: 'Select bounding box',
            imageTutorialDesc: 'Click annotation tool and click to select particular bounding box.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_delete_selected_bbox.gif',
            imageTutorialAlt: 'Delete selected bounding box',
            imageTutorialDesc: 'Click annotation tool, select and use delete key to remove the unwanted bounding box.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_bbox/dm_draw_bbox_remove_all_label.gif',
            imageTutorialAlt: 'Remove all label',
            imageTutorialDesc: 'Use eraser tool to remove all the bounding box on the image. ',
        },
    ];

    readonly drawPolygonId = 'modal-draw-polygon-tutorial';
    readonly drawPolygonTitle = 'How to Draw Polygon ?';
    readonly drawPolygonTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_pointer.gif',
            imageTutorialAlt: 'How to use pointer',
            imageTutorialDesc:
                'Click the pointer tool for moving the image and zoom in and out image using mouse scroll wheel.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_annotation_tool.png',
            imageTutorialAlt: 'Annotation tool',
            imageTutorialDesc: 'Click annotation tool to annotate image.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_draw.gif',
            imageTutorialAlt: 'Draw polygon',
            imageTutorialDesc:
                'Drawing polygon lines by clicking points around the object, then use enter key or double click to complete the polygon line.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_remove_previous_polygon_point.gif',
            imageTutorialAlt: 'Remove previous point',
            imageTutorialDesc:
                'When wrongly annotate the points, use backspace key to remove the previous polygon point.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_adjust_polygon.gif',
            imageTutorialAlt: 'Adjust polygon',
            imageTutorialDesc: 'Click the polygon point and drag to adjust the size of polygon around an object.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_label.gif',
            imageTutorialAlt: 'Select label',
            imageTutorialDesc: 'Select the label for the object from the label list.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_select_polygon.gif',
            imageTutorialAlt: 'Select a polygon',
            imageTutorialDesc: 'Click annotation tool and click to select particular polygon.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_delete_selected_polygon.gif',
            imageTutorialAlt: 'Delete selected polygon',
            imageTutorialDesc:
                'Click annotation tool, select a particular polygon and use delete or backspace key to remove the unwanted polygon.',
        },
        {
            imageTutorialPath: 'assets/tutorial/draw_polygon/dm_draw_polygon_remove_all_label.gif',
            imageTutorialAlt: 'Remove all label',
            imageTutorialDesc: 'Use eraser tool to remove all the polygon on the image. ',
        },
    ];

    readonly projectStatisticsId = 'modal-project-statistics-tutorial';
    readonly projectStatisticTitle = 'Show Project Statistics';
    readonly projectStatisticTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/project_statistics/dm_project_statistics_initial.gif',
            imageTutorialAlt: 'How to open project statistic in dataset card',
            imageTutorialDesc:
                'Click the three dots of dataset card, and choose project statistic. ' +
                'Initially, if no annotation has been performed, the current project statistics will show as in the diagram',
        },
        {
            imageTutorialPath: 'assets/tutorial/project_statistics/dm_project_statistics_dataset.gif',
            imageTutorialAlt: 'Charts plotted for the selected project',
            imageTutorialDesc:
                'When annotation had performed, charts will be plotted for the statistics of selected project',
        },
        {
            imageTutorialPath: 'assets/tutorial/project_statistics/dm_project_statistics_figures.gif',
            imageTutorialAlt: 'Check the number of labelled image, unlabelled image and label per class',
            imageTutorialDesc:
                'Hover over the pie chart and bar chart to check the numbers of labelled images' +
                ' unlabelled images and label of each classes.',
        },
        {
            imageTutorialPath: 'assets/tutorial/project_statistics/dm_project_statistics_workspace.gif',
            imageTutorialAlt: 'How to open project statistic in workspace',
            imageTutorialDesc:
                'In the workspace, click the statistic icon located at the right side bar to check the project statistics.',
        },
    ];

    readonly addImageId = 'modal-add-image-tutorial';
    readonly addImageTitle = 'Add Image to Project';
    readonly addImageTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/add_images/addImageTool.gif',
            imageTutorialAlt: 'How to open add image window',
            imageTutorialDesc: 'Click the add image icon at the right side bar to open the window.',
        },
        {
            imageTutorialPath: 'assets/tutorial/add_images/addimagewindow.png',
            imageTutorialAlt: 'add images and folder',
            imageTutorialDesc:
                'Two options are available, one is add selected images and the other is add images from selected folder.',
        },
        {
            imageTutorialPath: 'assets/tutorial/add_images/addImages.gif',
            imageTutorialAlt: 'Add images',
            imageTutorialDesc:
                'Select add images and select images from the pop up window to add into the project folder.',
        },
        {
            imageTutorialPath: 'assets/tutorial/add_images/addfolder.gif',
            imageTutorialAlt: 'Add folder',
            imageTutorialDesc:
                'Select add folder and select folder from the pop up window to add all the images from that ' +
                'folder into the project folder.',
        },
        {
            imageTutorialPath: 'assets/tutorial/add_images/addtoproject.gif',
            imageTutorialAlt: 'Images added to project',
            imageTutorialDesc:
                'Lastly, click submit and confirm to add images. The process will take awhile to complete. Once refresh, ' +
                'all the selected images are successfully added to the project folder.',
        },
    ];

    readonly shiftImageId = 'modal-shift-image-tutorial';
    readonly shiftImageTitle = 'Shift Image In Zoom Mode';
    readonly shiftImageTutorial = [
        {
            imageTutorialPath: 'assets/tutorial/shift_image/zoomin.gif',
            imageTutorialAlt: 'Zoom in',
            imageTutorialDesc:
                'Use shortcut key Alt + z to activate pointer tool and scroll the mouse wheel to zoom into the image.',
        },
        {
            imageTutorialPath: 'assets/tutorial/shift_image/drawpolygons.gif',
            imageTutorialAlt: 'Draw polygons',
            imageTutorialDesc:
                'Use shortcut key Alt + a to select annotation tool and draw polygons to the region of interest.',
        },
        {
            imageTutorialPath: 'assets/tutorial/shift_image/shiftimage.gif',
            imageTutorialAlt: 'Shift image',
            imageTutorialDesc:
                'If the region of interest is blocked, press the Ctrl/Command key once to active the shift image function.' +
                ' Navigate different area of image by dragging the image on the canvas. ',
        },
        {
            imageTutorialPath: 'assets/tutorial/shift_image/cancelandannotate.gif',
            imageTutorialAlt: 'Cancel shift function',
            imageTutorialDesc:
                'Press x key to cancel the shift image function, and continue annotate the polygon points',
        },
    ];

    tutorialIdx: number = 0;
    modalIdTutorial: string = this.createProjectId;
    tutorial: Tutorial[] = this.createProjectTutorial;
    modalTitle: string = this.createProjectTitle;
    tutorialBodyStyle: ModalBodyStyle = {
        minHeight: '55vh',
        maxHeight: '60vh',
        maxWidth: '70vw',
        margin: '8vw 71vh',
        overflow: 'none',
    };

    constructor(
        private _router: Router,
        private _modalService: ModalService,
        private _tutorialService: TutorialService,
        private elementRef: ElementRef,
    ) {
        const { url } = _router;
        this.bindImagePath(url);
        this._tutorialService.tutorial$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.tutorialState = state));
    }

    ngOnInit(): void {
        this.tutorialConfig(false, '');
    }

    tutorialConfig(ignoreCheckState: boolean, tutorialName: string) {
        const pageURL = this._router.url;
        if (pageURL === '/dataset' && !this.createProjectIntro && !this.tutorialState.createProject) {
            this.createProjectIntro = true;
            this.modalTitle = this.createProjectTitle;
            this.modalIdTutorial = this.createProjectId;
            this.tutorial = this.createProjectTutorial;
            this._tutorialService.setState({ createProject: true });
            this.openTutorial(true);
        } else if (pageURL === '/imglabel/bndbox' && !this.bndBoxIntro && !this.tutorialState.drawBbox) {
            this.bndBoxIntro = true;
            this.modalTitle = this.drawBboxTitle;
            this.modalIdTutorial = this.drawBboxId;
            this.tutorial = this.drawBboxTutorial;
            this._tutorialService.setState({ drawBbox: true });
            this.openTutorial(true);
        } else if (pageURL === '/imglabel/seg' && !this.polygonIntro && !this.tutorialState.drawPolygon) {
            this.polygonIntro = true;
            this.modalTitle = this.drawPolygonTitle;
            this.modalIdTutorial = this.drawPolygonId;
            this.tutorial = this.drawPolygonTutorial;
            this._tutorialService.setState({ drawPolygon: true });
            this.openTutorial(true);
        } else if (tutorialName === 'How to Create Project ') {
            this.modalTitle = this.createProjectTitle;
            this.modalIdTutorial = this.createProjectId;
            this.tutorial = this.createProjectTutorial;
            this._tutorialService.setState({ createProject: true });
            this.openTutorial(ignoreCheckState);
        } else if (tutorialName === 'How to Draw Bounding Box ') {
            this.modalTitle = this.drawBboxTitle;
            this.modalIdTutorial = this.drawBboxId;
            this.tutorial = this.drawBboxTutorial;
            this._tutorialService.setState({ drawBbox: true });
            this.openTutorial(ignoreCheckState);
        } else if (tutorialName === 'How to Draw Polygon ') {
            this.modalTitle = this.drawPolygonTitle;
            this.modalIdTutorial = this.drawPolygonId;
            this.tutorial = this.drawPolygonTutorial;
            this._tutorialService.setState({ drawPolygon: true });
            this.openTutorial(ignoreCheckState);
        } else if (tutorialName === 'Show Project Statistics ') {
            this.modalTitle = this.projectStatisticTitle;
            this.modalIdTutorial = this.projectStatisticsId;
            this.tutorial = this.projectStatisticTutorial;
            this._tutorialService.setState({ projectStatistics: true });
            this.openTutorial(ignoreCheckState);
        } else if (tutorialName === 'Add Image To Project ') {
            this.modalTitle = this.addImageTitle;
            this.modalIdTutorial = this.addImageId;
            this.tutorial = this.addImageTutorial;
            this._tutorialService.setState({ addImage: true });
            this.openTutorial(ignoreCheckState);
        } else if (tutorialName === 'Shift Image in Zoom Mode ') {
            this.modalTitle = this.shiftImageTitle;
            this.modalIdTutorial = this.shiftImageId;
            this.tutorial = this.shiftImageTutorial;
            this._tutorialService.setState({ shiftImage: true });
            this.openTutorial(ignoreCheckState);
        }
        this.tutorialMenuToggle = false;
        this.isToggle = false;
    }

    openTutorial(ignoreCheckState: boolean) {
        if (!ignoreCheckState) {
            setTimeout(() => {
                this.tutorialIdx = 0;
                this._modalService.open(this.modalIdTutorial);
            }, 1000);
        } else {
            // Must set delay to wait for component to reload
            setTimeout(() => {
                this.tutorialIdx = 0;
                this._modalService.open(this.modalIdTutorial);
            }, 100);
        }
    }

    prevTutorial() {
        this.tutorialIdx--;
    }

    nextTutorial() {
        this.tutorialIdx++;
    }

    endTutorial() {
        this._modalService.close(this.modalIdTutorial);
    }

    bindImagePath = (url: string) => {
        this.jsonSchema = {
            logos:
                url === '/imglabel'
                    ? [
                          {
                              imgPath: `assets/icons/add_user.svg`,
                              hoverLabel: `Add user to project`,
                              alt: `pageHeader.addUser`,
                              onClick: () => null,
                          },
                          // {
                          //     imgPath: `assets/icons/workspaces.svg`,
                          //     hoverLabel: `Workspaces`,
                          //     alt: `Workspaces`,
                          // },
                          // {
                          //     imgPath: `assets/icons/upload.svg`,
                          //     hoverLabel: `Share / Upload`,
                          //     alt: `Upload`,
                          // },
                      ]
                    : [
                          {
                              imgPath: `assets/icons/profile.svg`,
                              hoverLabel: `pageHeader.profile`,
                              alt: `Profile`,
                              onClick: () => null,
                          },
                      ],
        };
    };

    toggleTutorialMenu() {
        if (this.isToggle) {
            this.tutorialMenuToggle = false;
            this.isToggle = false;
        } else {
            this.tutorialMenuToggle = true;
            this.isToggle = true;
        }
    }

    @HostListener('document:click', ['$event.target'])
    resetSelection(target: EventTarget) {
        const withinComponent = this.elementRef.nativeElement.contains(target);
        if (!withinComponent) {
            this.tutorialMenuToggle = false;
        }
    }
}
