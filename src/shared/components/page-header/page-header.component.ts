import { TutorialService, TutorialState } from './../../services/tutorial.service';
/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
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
    ) {
        const { url } = _router;
        this.bindImagePath(url);
        this._tutorialService.tutorial$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((state) => (this.tutorialState = state));
    }

    ngOnInit(): void {
        const pageURL = this._router.url;
        if (pageURL === '/dataset') {
            if (!this.tutorialState.createProject) {
                this.modalTitle = this.createProjectTitle;
                this.modalIdTutorial = this.createProjectId;
                this.tutorial = this.createProjectTutorial;
                this._tutorialService.setState({ createProject: true });
                this.openTutorial();
            }
        } else if (pageURL === '/imglabel/bndbox') {
            if (!this.tutorialState.drawBbox) {
                this.modalTitle = this.drawBboxTitle;
                this.modalIdTutorial = this.drawBboxId;
                this.tutorial = this.drawBboxTutorial;
                this._tutorialService.setState({ drawBbox: true });
                this.openTutorial();
            }
        }
    }

    openTutorial() {
        setTimeout(() => {
            this.tutorialIdx = 0;
            this._modalService.open(this.modalIdTutorial);
        }, 1000);
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
}
