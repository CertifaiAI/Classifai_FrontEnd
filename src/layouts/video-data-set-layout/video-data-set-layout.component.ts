/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { cloneDeep } from 'lodash-es';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { VideoDataSetLayoutApiService } from './video-data-set-layout-api.service';
import {
    DataSetProps,
    Project,
    ProjectRename,
    ProjectSchema,
    StarredProps,
} from '../../shared/types/dataset-layout/data-set-layout.model';
import { distinctUntilChanged, first, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { VideoLabellingModeService } from 'components/video-labelling/video-labelling-mode.service';
import { LanguageService } from 'shared/services/language.service';
import { MessageUploadStatus, ProjectMessage } from 'shared/types/message/message.model';
import { ModalBodyStyle } from 'shared/types/modal/modal.model';
import { ModalService } from 'shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'shared/components/spinner/spinner.service';
import { BboxMetadata, PolyMetadata } from 'shared/types/image-labelling/image-labelling.model';
import { VideoLabellingMode } from '../../shared/types/video-labelling/video-labelling.model';

type FormattedProject = {
    created_timestamp: Date;
    last_modified_timestamp: Date;
    created_date: string;
    last_modified_date: string;
    project_name: string;
    project_path: string;
    is_loaded: boolean;
    is_starred: boolean;
    is_new: boolean;
    total_uuid: number;
    root_path_valid: boolean;
};

@Component({
    selector: 'video-data-set-layout',
    templateUrl: './video-data-set-layout.component.html',
    styleUrls: ['./video-data-set-layout.component.scss'],
})
export class VideoDataSetLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema: DataSetProps = {
        currentThumbnailIndex: -1,
        thumbnailName: '',
        totalNumThumbnail: 0,
        status: undefined,
    };
    projectList: ProjectSchema = {
        projects: [],
        isUploading: false,
        isFetching: false,
    };
    sortedProject: Project[] = [];
    inputProjectName: string = '';
    inputFrameInterval: number = 0;
    newInputProjectName: string = '';
    selectedProjectName: string = '';
    oldProjectName: string = '';
    form!: FormGroup;
    renameForm!: FormGroup;
    step: any = 1;
    subject$: Subject<any> = new Subject();
    subjectSubscription?: Subscription;
    thumbnailList: BboxMetadata[] & PolyMetadata[] = [];
    labelList: string[] = [];
    unsubscribe$: Subject<any> = new Subject();
    isLoading = false;
    isOverlayOn = false;
    isImageUploading = false;
    isProjectLoading = false;
    isDeleteSuccess = false;
    projectName: string = '';
    videoLblMode: VideoLabellingMode = null;
    modalSpanMessage: string = '';
    modalImportProjectName: string = '';
    spanClass: string = '';
    labelPath: string = '';
    videoPath: string = '';
    projectFolderPath: string = '';
    showLabelTooltip: boolean = false;
    unsupportedImageList: string[] = [];
    keyToSort: string = 'project_name';
    projectType: string = 'myproject';
    enableSort: boolean = true;
    partition: number = 1;
    readonly modalIdCreateProject = 'modal-create-project';
    readonly modalIdRenameProject = 'modal-rename-project';
    readonly modalIdImportProject = 'modal-import-project';
    readonly modalIdDeleteProject = 'modal-delete-project';
    readonly modalIdRenameSuccess = 'modal-rename-success';
    readonly modalUnsupportedImage = 'modal-unsupported-image';
    createProjectModalBodyStyle: ModalBodyStyle = {
        minHeight: '45vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '5vw 5vh',
        overflow: 'none',
    };
    renameProjectModalBodyStyle: ModalBodyStyle = {
        minHeight: '23vh',
        maxHeight: '25vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    importProjectModalBodyStyle: ModalBodyStyle = {
        minHeight: '15vh',
        maxHeight: '25vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    deleteProjectBodyStyle: ModalBodyStyle = {
        minHeight: '11vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    renameSuccessBodyStyle: ModalBodyStyle = {
        minHeight: '11vh',
        maxHeight: '11vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    unsupportedImageBodyStyle: ModalBodyStyle = {
        minHeight: '18vh',
        maxHeight: '30vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };

    @ViewChild('refProjectName') _refProjectName!: ElementRef<HTMLInputElement>;
    @ViewChild('projectfoldername') _projectFoldername!: ElementRef<HTMLLabelElement>;
    @ViewChild('labeltextfilename') _labelTextFilename!: ElementRef<HTMLLabelElement>;
    @ViewChild('videofilename') _videoFilename!: ElementRef<HTMLLabelElement>;
    @ViewChild('refNewProjectName') _refNewProjectName!: ElementRef<HTMLInputElement>;
    @ViewChild('jsonImportProjectFile') _jsonImportProjectFile!: ElementRef<HTMLInputElement>;
    @ViewChild('jsonImportProjectFilename') _jsonImportProjectFilename!: ElementRef<HTMLLabelElement>;
    @ViewChild('refFrameInterval') _refFrameInterval!: ElementRef<HTMLInputElement>;
    @ViewChild('selectedPartition') _selectedPartition!: ElementRef<HTMLInputElement>;
    @ViewChild('partitionValue') _partitionValue!: ElementRef<HTMLLabelElement>;

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _dataSetService: VideoDataSetLayoutApiService,
        private _spinnerService: SpinnerService,
        private _videoLblModeService: VideoLabellingModeService,
        private _languageService: LanguageService,
        private _modalService: ModalService,
    ) {
        this._videoLblModeService.videoLabelMode$
            .pipe(distinctUntilChanged())
            .subscribe((modeVal) => (this.videoLblMode = modeVal));

        this._spinnerService
            .returnAsObservable()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((loading) => (this.isLoading = loading));

        this.createFormControls();
        this.renameFormControls();
        const langsArr: string[] = ['data-set-page-en', 'data-set-page-cn', 'data-set-page-ms'];
        this._languageService.initializeLanguage(`data-set-page`, langsArr);
    }

    ngOnInit(): void {
        this.showProjectList();
    }

    next() {
        this.step++;
    }

    keyIsSelected = (value: string) => {
        this.keyToSort = value;
        this.showProjectList(this.projectType);
    };

    showProjectList = (projectType: string = 'myproject'): void => {
        this.projectList.isFetching = true;
        this._dataSetService
            .getProjectList()
            .pipe(first())
            .subscribe(
                ({ content }) => {
                    if (content) {
                        this.handleProjectList(content, projectType);
                    }
                },
                (error: Error) => {
                    console.error(error);
                    this.projectList.isFetching = false;
                },
            );
    };

    handleProjectList(content: Project[], projectType: string) {
        const clonedProjectList = cloneDeep(content);

        const formattedProjectList: FormattedProject[] = clonedProjectList.map((project) => {
            return {
                ...project,
                created_timestamp: this.formatTimestamp(project.created_date),
                last_modified_timestamp: this.formatTimestamp(project.last_modified_date),
                created_date: this.formatDate(project.created_date),
                last_modified_date: this.formatDate(project.last_modified_date),
            };
        });

        this.projectTypeFilter(projectType, formattedProjectList);
        this.enableSort && this.projectSort();

        /**
         * !! IMPORTANT
         * @author Daniel Lim Heng Jie
         * @description converted to ES6 style to trick Angular's Lifecycle
         * to allow the bypass of it to always be unequal object compare during lifecyckle hooks checking (ngOnChanges)
         * as comp "data-set-card" needs to check prop changes
         * via ngOnChanges to run logic
         */
        this.projectList = {
            ...this.projectList,
            projects: this.sortedProject,
            isFetching: false,
        };
    }

    private projectTypeFilter(projectType: string, formattedProjectList: FormattedProject[]) {
        switch (projectType) {
            case 'starred':
                this.sortedProject = formattedProjectList.filter((proj) => proj.is_starred);
                break;
            case 'recent':
                this.sortedProject = this.sortProjectByModifiedTimestamp(formattedProjectList);
                this.sortedProject = this.sortedProject.slice(0, 6);
                break;
            default:
                this.sortedProject = formattedProjectList;
                break;
        }
    }

    private projectSort() {
        switch (this.keyToSort) {
            case 'project_name':
                this.sortedProject.sort((a, b) => (b.project_name < a.project_name ? 1 : -1));
                break;
            case 'created_date':
                this.sortedProject.sort((a, b) => (b.created_timestamp > a.created_timestamp ? 1 : -1));
                break;
            case 'last_modified_date':
                this.sortedProject.sort((a, b) => (b.last_modified_timestamp > a.last_modified_timestamp ? 1 : -1));
                break;
            default:
                this.sortedProject.sort((a, b) => (b.project_name < a.project_name ? 1 : -1));
                break;
        }
    }

    private sortProjectByModifiedTimestamp(formattedProjectList: FormattedProject[]) {
        return formattedProjectList.sort((a, b) => (b.last_modified_timestamp > a.last_modified_timestamp ? 1 : -1));
    }

    filterProjects = (id: string) => {
        this.projectType = id;
        this.enableSort = id === 'recent' ? false : true;
        this.showProjectList(id);
    };

    formatDate = (date: string): string => {
        const initializedDate: Date = new Date(date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const actualMonth: string | undefined = monthNames.find(
            (_, i) => i === initializedDate.getMonth() || undefined,
        );
        return actualMonth ? `${actualMonth}-${initializedDate.getDate()}-${initializedDate.getFullYear()}` : 'Error';
    };

    formatTimestamp = (date: string): Date => {
        return new Date(date);
    };

    createFormControls = (): void => {
        this.form = this._fb.group({
            projectName: new FormControl('', Validators.required),
            frameInterval: new FormControl('', Validators.required),
        });
    };

    renameFormControls = (): void => {
        this.renameForm = this._fb.group({
            newProjectName: ['', Validators.required],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    onChangeRename = (val: string): void => {
        this.newInputProjectName = val;
    };

    toggleModalDisplay = (shown: boolean): void => {
        // this.videoPath = '';
        // this.step = 1;
        this._videoFilename.nativeElement.innerHTML = ''; // if design 1, this one no need
        this._projectFoldername.nativeElement.innerHTML = '';
        this._labelTextFilename.nativeElement.innerHTML = '';
        shown && this.form.reset();
        shown
            ? this._modalService.open(this.modalIdCreateProject)
            : this._modalService.close(this.modalIdCreateProject);
    };

    toggleRenameModalDisplay = (event?: ProjectRename): void => {
        if (!event) {
            this._modalService.close(this.modalIdRenameProject);
            return;
        }
        const { shown, projectName } = event;
        shown ? this.openRenameModal() : this._modalService.close(this.modalIdRenameProject);
        this.oldProjectName = projectName;
    };

    openRenameModal() {
        this.renameForm.reset();
        this._modalService.open(this.modalIdRenameProject);
    }

    toggleImportProjectModalDisplay = (event: any): void => {
        this.modalSpanMessage = '';
        event
            ? this._modalService.open(this.modalIdImportProject)
            : this._modalService.close(this.modalIdImportProject);
    };

    onSelectImportProjectJson = (): void => {
        this.toggleImportProjectModalDisplay(true);
        const importStatus$ = this._dataSetService.importStatus();
        const importProject$ = this._dataSetService.importProject();
        importProject$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                let refreshProjectList = false;
                interval(500)
                    .pipe(
                        switchMap(() => importStatus$),
                        first((response) => {
                            this.isOverlayOn =
                                response.file_system_status === 1 || response.file_system_status === 2 ? true : false;
                            if (
                                response.file_system_status === 0 ||
                                response.file_system_status === 3 ||
                                response.file_system_status === 5
                            ) {
                                refreshProjectList = true;
                            }

                            return refreshProjectList;
                        }),
                    )
                    .subscribe((response) => {
                        this.modalSpanMessage =
                            response.file_system_message === 'DATABASE_UPDATED' ? 'importSuccess' : 'importAborted';
                        this.modalImportProjectName =
                            response.file_system_message === 'DATABASE_UPDATED' && response.project_name
                                ? response.project_name
                                : '';
                        if (response.file_system_status === 5) {
                            this.processIsSuccess(false);
                        } else {
                            this.processIsSuccess(true);
                        }
                        this.showProjectList(this.projectType);
                    });
            });
    };

    processIsSuccess = (success: boolean): void => {
        if (success) {
            this.spanClass = 'validation-success';
        } else {
            this.spanClass = 'validation-error';
        }
    };

    importProject = (): void => {
        this.toggleImportProjectModalDisplay(true);
    };

    onStarred = ({ projectName, starred }: StarredProps) => {
        this._dataSetService
            .updateProjectStatus(projectName, starred, 'star')
            .pipe(first())
            .subscribe(
                ({ message }) => console.log(message),
                (error: Error) =>
                    (this.projectList = {
                        isUploading: this.projectList.isUploading,
                        isFetching: this.projectList.isFetching,
                        projects: this.projectList.projects.map((project) =>
                            project.project_name === projectName
                                ? {
                                      ...project,
                                      is_starred: false,
                                  }
                                : project,
                        ),
                    }),
            );
    };

    onSubmit = (isNewProject: boolean, projectName?: string): void => {
        this.form.markAllAsTouched();

        if (!isNewProject) {
            projectName && this.startProject(projectName);
        } else {
            if (this.inputProjectName) {
                const checkExistProject =
                    this.projectList.projects &&
                    this.projectList.projects.find(
                        (project) => project && project.project_name === this.inputProjectName,
                    );
                checkExistProject ? this.projectExistError() : this.startCreateProject(this.inputProjectName);
            } else {
                this.form.get('projectName')?.setErrors({ required: true });
                this._refProjectName.nativeElement.focus();
            }
        }
    };

    projectExistError() {
        this.form.get('projectName')?.setErrors({ exist: true });
        this._refProjectName.nativeElement.focus();
    }

    startCreateProject(inputProjectName: string) {
        this.createProject(inputProjectName);
        this.selectedProjectName = this.form.get('projectName')?.value;
    }

    onSubmitRename() {
        this.renameForm.markAllAsTouched();
        if (this.newInputProjectName) {
            const checkExistProject =
                this.projectList.projects &&
                this.projectList.projects.find((project) =>
                    project ? project.project_name === this.newInputProjectName : null,
                );
            checkExistProject
                ? this.newProjectNameError()
                : this.startRenameProject(this.oldProjectName, this.newInputProjectName);
        } else {
            this.renameForm.get('newProjectName')?.setErrors({ required: true });
            this._refProjectName.nativeElement.focus();
        }
    }

    newProjectNameError() {
        this.renameForm.get('newProjectName')?.setErrors({ exist: true });
        this._refProjectName.nativeElement.focus();
    }

    startRenameProject(oldName: string, newName: string) {
        this.renameProject(oldName, newName);
        this.selectedProjectName = this.renameForm.get('newProjectName')?.value;
    }

    startProject = (projectName: string): void => {
        this._router.navigate([`videolabel/${this.videoLblMode}`], {
            state: { projectName, videoPath: this.videoPath, partition: this.partition },
        });
    };

    isCreateFormIncomplete() {
        return this.inputProjectName === '' || this.projectFolderPath === '';
    }

    createProject = (projectName: string): void => {
        const createProj$ = this._dataSetService.createNewProject(
            projectName,
            this.labelPath,
            this.projectFolderPath,
            this.videoPath,
        );

        const uploadStatus$ = this._dataSetService.localUploadStatus(projectName);
        let numberOfReq: number = 0;

        const returnResponse = ({
            message,
            error_code,
            error_message,
        }: ProjectMessage): Observable<MessageUploadStatus> => {
            return message === 1
                ? interval(500).pipe(
                      mergeMap(() => uploadStatus$),
                      /** @property {number} message value 4 means upload completed, value 1 means cancelled */
                      first(({ file_system_status, unsupported_image_list }) => {
                          this.unsupportedImageList = unsupported_image_list;
                          this.isOverlayOn = file_system_status === 1 || file_system_status === 2 ? true : false;
                          this.isImageUploading = file_system_status === 2 ? true : false;
                          return file_system_status === 3;
                      }),
                  )
                : throwError(new Error(`ERROR ${error_code}: ${error_message}`));
        };
        this.projectList = { ...this.projectList, isUploading: true };
        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                mergeMap(() => createProj$),
                mergeMap((message) => returnResponse(message)),
            )
            .subscribe(
                (res) => {
                    if (res.file_system_status === 3) {
                        this.toggleModalDisplay(false);
                    }
                    this.isProjectLoading = true;
                    numberOfReq = res ? --numberOfReq : numberOfReq;
                    numberOfReq < 1 && (this.projectList = { ...this.projectList, isUploading: false });
                },
                (error: Error) => {
                    console.log(error);
                },
                () => {
                    this.isProjectLoading = false;
                    this.showProjectList(this.projectType);
                    this.unsupportedImageList.length > 0 &&
                        this._dataSetService
                            .downloadUnsupportedImageList(projectName, this.unsupportedImageList)
                            .then((res) => {
                                res && this._modalService.open(this.modalUnsupportedImage);
                            });
                },
            );

        // make initial call
        this.subject$.next();
    };

    selectProjectFolder() {
        const importProjectFolderStatus$ = this._dataSetService.importProjectFolderStatus();
        const importProjectFolder$ = this._dataSetService.importProjectFolder();
        importProjectFolder$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                let windowClosed = false;
                interval(500)
                    .pipe(
                        switchMap(() => importProjectFolderStatus$),
                        first((response) => {
                            this.isOverlayOn = response.window_status === 0 ? true : false;
                            if (response.window_status === 1 && response.project_path !== '') {
                                this._projectFoldername.nativeElement.innerHTML = response.project_path.replace(
                                    /^.*[\\\/]/,
                                    '',
                                );
                                this.projectFolderPath = response.project_path;
                            }
                            if (response.window_status === 1) {
                                windowClosed = true;
                            }
                            return windowClosed;
                        }),
                    )
                    .subscribe((response) => {
                        this.showProjectList(this.projectType);
                    });
            });
    }

    importLabelFile() {
        const importLabelFileStatus$ = this._dataSetService.importLabelFileStatus();
        const importLabelFile$ = this._dataSetService.importLabelFile();
        importLabelFile$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                let windowClosed = false;
                interval(500)
                    .pipe(
                        switchMap(() => importLabelFileStatus$),
                        first((response) => {
                            this.isOverlayOn = response.window_status === 0 ? true : false;
                            if (response.window_status === 1 && response.label_file_path !== '') {
                                this._labelTextFilename.nativeElement.innerHTML = response.label_file_path.replace(
                                    /^.*[\\\/]/,
                                    '',
                                );
                                this.labelPath = response.label_file_path;
                            }
                            if (response.window_status === 1) {
                                windowClosed = true;
                            }
                            return windowClosed;
                        }),
                    )
                    .subscribe((response) => {
                        this.showProjectList(this.projectType);
                    });
            });
    }

    importVideoFile() {
        const importVideoFileStatus$ = this._dataSetService.importVideoFileStatus();
        const importVideoFile$ = this._dataSetService.importVideoFile();
        importVideoFile$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                let windowClosed = false;
                interval(500)
                    .pipe(
                        switchMap(() => importVideoFileStatus$),
                        first((response) => {
                            this.isOverlayOn = response.window_status === 0 ? true : false;
                            if (response.window_status === 1 && response.video_file_path !== '') {
                                this._videoFilename.nativeElement.innerHTML = response.video_file_path.replace(
                                    /^.*[\\\/]/,
                                    '',
                                );
                                this.videoPath = response.video_file_path;
                            }
                            if (response.window_status === 1) {
                                windowClosed = true;
                            }
                            return windowClosed;
                        }),
                    )
                    .subscribe((response) => {
                        this.showProjectList(this.projectType);
                    });
            });
    }

    renameProject = (oldProjectName: string, newProjectName: string): void => {
        const renameProject$ = this._dataSetService.renameProject(oldProjectName, newProjectName);

        renameProject$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                if (message === 1) {
                    this._languageService._translate.get('renameSuccess').subscribe((translated) => {
                        this.projectName = oldProjectName;
                        this.modalSpanMessage = translated;
                        this._modalService.open(this.modalIdRenameSuccess);
                    });
                    this.showProjectList(this.projectType);
                    this.toggleRenameModalDisplay();
                }
            });
    };

    deleteProject = (projectName: string): void => {
        this.isDeleteSuccess = false;
        this.projectName = projectName;
        this._languageService._translate.get('deleteSuccess').subscribe((translated) => {
            this.projectName = projectName;
            this._modalService.open(this.modalIdDeleteProject);
        });
    };

    confirmDeleteProject = (): void => {
        const deleteProj$ = this._dataSetService.deleteProject(this.projectName);

        deleteProj$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                if (message === 1) {
                    this.isDeleteSuccess = true;
                    this.showProjectList(this.projectType);
                }
            });
    };

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key }: KeyboardEvent): void => {
        key === 'Escape' && this.toggleRenameModalDisplay() && this.toggleModalDisplay(false);
    };

    /** @event fires whenever browser is closing */
    @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: BeforeUnloadEvent): void {
        event.preventDefault();
        if (this.isProjectLoading) {
            event.returnValue = 'Are you sure you want to leave this page?';
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    selectPartition() {
        this.partition = Number(this._selectedPartition.nativeElement.value);
        this._partitionValue.nativeElement.innerHTML = this._selectedPartition.nativeElement.value + ' frame interval';
    }
}