/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { first, mergeMap, takeUntil, concatMap } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ModalService } from 'shared/components/modal/modal.service';
import { VideoDataSetLayoutApiService } from 'layouts/video-data-set-layout/video-data-set-layout-api.service';
import { AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { VideoLabellingActionService } from 'components/video-labelling/video-labelling-action.service';
import { VideoLabellingLayoutService } from 'layouts/video-labelling-layout/video-labelling-layout.service';
import { VideoLabellingModeService } from 'components/video-labelling/video-labelling-mode.service';
import { LanguageService } from 'shared/services/language.service';
import { SpinnerService } from 'shared/components/spinner/spinner.service';
import {
    ExportSaveFormatService,
    ExportSaveType,
    ProcessResponse,
    SaveFormat,
} from 'shared/services/export-save-format.service';
import { VideoLabellingApiService } from 'components/video-labelling/video-labelling-api.service';
import {
    AddSubLabel,
    VideoLabelUrl,
    VideoLabelProps,
    LabelChoosen,
    ChangeAnnotationLabel,
    EventEmitter_Action,
    EventEmitter_ThumbnailDetails,
    SelectedLabelProps,
    BboxMetadata,
    CompleteMetadata,
    PolyMetadata,
    TabsProps,
} from 'shared/types/video-labelling/video-labelling.model';
import { ModalBodyStyle } from 'shared/types/modal/modal.model';
import { ProjectSchema } from 'shared/types/dataset-layout/data-set-layout.model';
import { ExportStatus, Message } from 'shared/types/message/message.model';
import { EventEmitter_Url } from 'shared/types/image-labelling/image-labelling.model';
import { HTMLElementEvent } from 'shared/types/field/field.model';

@Component({
    selector: 'app-video-labelling-layout',
    templateUrl: 'video-labelling-layout.component.html',
    styleUrls: ['video-labelling-layout.component.scss'],
})
export class VideoLabellingLayoutComponent implements OnInit, OnDestroy {
    tabStatus: TabsProps<CompleteMetadata>[] = [
        {
            name: 'labellingProject.project',
            closed: false,
        },
        {
            name: 'labellingProject.label',
            closed: false,
            label_list: [],
        },
        {
            name: 'labellingProject.annotation',
            closed: false,
            annotation: [],
        },
    ];
    onChangeSchema!: VideoLabelProps;
    currentUrl: VideoLabelUrl = '';
    selectedProjectName: string = '';
    imgSrc: string = '';
    loading: boolean = false;
    thumbnailList: CompleteMetadata[] = [];
    selectedMetaData?: CompleteMetadata;
    unsubscribe$: Subject<any> = new Subject();
    subject$: Subject<any> = new Subject();
    subjectSubscription?: Subscription;
    mainLabelRegionVal = '';
    subLabelRegionVal = '';
    addedSubLabelList?: AddSubLabel[];
    subLabelValidateMsg = '';
    currentAnnotationLabel = '';
    currentAnnotationIndex = -1;
    currentImageDisplayIndex = -1;
    isLoading: boolean = false;
    showLoading: boolean = false;
    processingNum: number = 0;
    unsupportedImageList: string[] = [];
    spanClass: string = '';
    modalSpanMessage: string = '';
    modalSpanLocationPath: string = '';
    sliceNum: number = 0;
    labelList: string[] = [];
    isOverlayOn = false;
    blockLoadThumbnails: boolean = false;
    totalUuid: number = 0;
    labelChoosen: LabelChoosen[] = [];
    tempLabelChoosen: LabelChoosen[] = [];
    warningMessage: string = '';
    imgPath: string = '';
    imgPathSplit: string[] = [];
    newImageName: string = '';
    imageExt: string | undefined;
    selectedUuid: string = '';
    renameImageErrorCode: number = -1;
    dontAskDelete: boolean = false;
    videoLength: number = 0;
    readonly modalExportOptions = 'modal-export-options';
    readonly modalExportProject = 'modal-export-project';
    readonly modalShortcutKeyInfo = 'modal-shortcut-key-info';
    readonly modalUnsupportedImage = 'modal-unsupported-image';
    readonly modalExportWarning = 'modalExportWarning';
    readonly modalRenameImage = 'modal-rename-image';
    readonly modalDeleteImage = 'modal-delete-image';
    exportModalBodyStyle: ModalBodyStyle = {
        minHeight: '15vh',
        maxHeight: '15vh',
        minWidth: '19.5vw',
        maxWidth: '19.5vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    saveModalBodyStyle: ModalBodyStyle = {
        maxHeight: '80vh',
        minWidth: '28vw',
        maxWidth: '28vw',
        margin: '10vh 28vw',
        overflow: 'none',
    };
    advModalBodyStyle: ModalBodyStyle = {
        maxHeight: '80vh',
        minWidth: '18vw',
        maxWidth: '18vw',
        margin: '10vh 28vw',
        overflow: 'none',
    };
    infoModalBodyStyle: ModalBodyStyle = {
        maxHeight: '50vh',
        minWidth: '40vw',
        maxWidth: '40vw',
        margin: '20vh 23vw',
        padding: '0vh 0vw 3vh 0vw',
        overflow: 'none',
    };
    exportProjectBodyStyle: ModalBodyStyle = {
        minHeight: '10vh',
        maxHeight: '30vh',
        minWidth: '31vw',
        maxWidth: '31vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    exportWarningBodyStyle: ModalBodyStyle = {
        minHeight: '10vh',
        maxHeight: '20vh',
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
    renameImageBodyStyle: ModalBodyStyle = {
        minHeight: '18vh',
        maxHeight: '30vh',
        minWidth: '20vw',
        maxWidth: '20vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    deleteImageBodyStyle: ModalBodyStyle = {
        minHeight: '18vh',
        maxHeight: '30vh',
        minWidth: '20vw',
        maxWidth: '20vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    saveType: ExportSaveType = {
        saveCurrentImage: true,
        saveBulk: false,
    };
    projectList: ProjectSchema = {
        projects: [],
        isUploading: false,
        isFetching: false,
    };

    @ViewChild('subLabelSelect') _subLabelSelect!: ElementRef<{ value: string }>;
    @ViewChild('renameInput') _renameInput!: ElementRef<HTMLInputElement>;
    @ViewChild('deleteBtn') _deleteBtn!: ElementRef<HTMLButtonElement>;

    constructor(
        public _router: Router,
        private _videoLblApiService: VideoLabellingApiService,
        private _modalService: ModalService,
        private _videoDataSetService: VideoDataSetLayoutApiService,
        private _annotateService: AnnotateSelectionService,
        private _videoLblActionService: VideoLabellingActionService,
        private _videoLblLayoutService: VideoLabellingLayoutService,
        private _videoLblModeService: VideoLabellingModeService,
        public _languageService: LanguageService,
        private _spinnerService: SpinnerService,
        private _exportSaveFormatService: ExportSaveFormatService,
    ) {
        const langsArr: string[] = ['image-labelling-en', 'image-labelling-cn', 'image-labelling-ms'];
        this._languageService.initializeLanguage(`image-labelling`, langsArr);
    }

    ngOnInit(): void {
        this.currentUrl = this._router.url as VideoLabelUrl;
        const { projectName } = this._videoLblLayoutService.getRouteState(history);
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };

        setTimeout(() => this.startProject(this.selectedProjectName), 5000);
    }

    videoExtraction(): void {
        const { videoPath } = this._videoLblLayoutService.getRouteState(history);
        this._videoDataSetService.initiateVideoExtraction(videoPath, this.selectedProjectName).subscribe();
    }

    startProject = (projectName: string): void => {
        this.isLoading = true;
        this.selectedProjectName = projectName;
        const projMetaStatus$ = this._videoDataSetService.checkProjectStatus(projectName);
        const updateProjLoadStatus$ = this._videoDataSetService.updateProjectLoadStatus(projectName);
        const projLoadingStatus$ = this._videoDataSetService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._videoDataSetService.getThumbnailList;

        this.subjectSubscription = this.subject$
            .pipe(
                concatMap(() => forkJoin([projMetaStatus$])),
                first(([{ message, content }]) => {
                    this.totalUuid = content[0].total_uuid;
                    this.videoLength = content[0].video_length;
                    this.projectList = {
                        isUploading: this.projectList.isUploading,
                        isFetching: this.projectList.isFetching,
                        projects: this.projectList.projects.map((project) =>
                            project.project_name === content[0].project_name
                                ? { ...content[0], created_date: project.created_date }
                                : project,
                        ),
                    };
                    const { is_loaded } = content[0];
                    return message === 1 && !is_loaded ? true : false;
                }),
                concatMap(([{ message }]) => (!message ? [] : forkJoin([updateProjLoadStatus$, projLoadingStatus$]))),
                concatMap(([{ message: updateProjStatus }, { message: loadProjStatus, uuid_list, label_list }]) => {
                    if (loadProjStatus === 2) {
                        this.labelList = [...label_list];
                        this.tabStatus[1].label_list = this.labelList;
                        return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
                    } else {
                        return interval(500).pipe(
                            concatMap(() => projLoadingStatus$),
                            first(({ message }) => message === 2),
                            concatMap((labelList) => {
                                this.tabStatus[1].label_list = labelList.label_list;
                                return labelList.uuid_list.length > 0
                                    ? labelList.uuid_list
                                          .slice(this.sliceNum, (this.sliceNum += 20))
                                          .map((uuid) => thumbnail$(projectName, uuid))
                                    : [];
                            }),
                        );
                    }
                }),
                // * this mergeMap responsible for flaten all observable into one layer
                concatMap((data) => data),
            )
            .subscribe(
                (res) => {
                    this.thumbnailList = [...this.thumbnailList, res];
                    this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
                },
                (error: Error) => {
                    /** This is intentional */
                },
                () => {
                    this.isLoading = false;
                    this._annotateService.labelStaging$
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                            if (isDlbClick) {
                                this.currentAnnotationIndex = annnotationIndex;
                                this.tabStatus.forEach(({ annotation }) =>
                                    annotation?.forEach(({ bnd_box, polygons }) => {
                                        const dynamicProp = bnd_box ?? polygons;
                                        if (dynamicProp) {
                                            const { label, region } = dynamicProp[annnotationIndex];
                                            this.currentAnnotationLabel = label;
                                            this.mainLabelRegionVal = region || '';
                                        } else {
                                            console.log('missing prop bnd_box OR polygons');
                                        }
                                    }),
                                );
                                this._videoLblActionService.setState({
                                    isActiveModal: true,
                                    draw: false,
                                    drag: false,
                                    scroll: false,
                                });
                                this.onDisplayModal();
                            } else {
                                this.currentAnnotationLabel = '';
                                this.currentAnnotationIndex = annnotationIndex;
                            }
                        });

                    // subscription logic to check if clear is true then empty the current display image's metadata
                    this._videoLblActionService.action$
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(({ clear, save, keyInfo }) => {
                            if (clear) {
                                this.thumbnailList[0].bnd_box &&
                                    (this.thumbnailList[this.currentImageDisplayIndex].bnd_box = []);
                                this.thumbnailList[0].polygons &&
                                    (this.thumbnailList[this.currentImageDisplayIndex].polygons = []);

                                this.onChangeSchema = {
                                    ...this.onChangeSchema,
                                    hasAnnotation: false,
                                };
                            }
                            if (save) {
                                this.labelChoosen = this.tabStatus[1].label_list
                                    ? this.tabStatus[1].label_list.map((label) => ({ label, isChoosen: true }))
                                    : [];
                                this.onDisplayModal('modal-save');
                            }

                            if (keyInfo) {
                                this.onDisplayShortcutKeyInfo();
                            }
                        });
                    this.navigateByAction({ thumbnailAction: 1 });
                    this._spinnerService.hideSpinner();
                },
            );
        // make initial call
        this.subject$.next();
    };

    loadThumbnails = (): void => {
        if (!this.blockLoadThumbnails && this.sliceNum < this.totalUuid) {
            this.blockLoadThumbnails = true;
            const projLoadingStatus$ = this._videoDataSetService.checkExistProjectStatus(this.selectedProjectName);
            const thumbnail$ = this._videoDataSetService.getThumbnailList;

            this.subjectSubscription = this.subject$
                .pipe(
                    first(),
                    concatMap(() => {
                        return interval(500).pipe(
                            concatMap(() => projLoadingStatus$),
                            first(({ message }) => message === 2),
                            concatMap(({ uuid_list }) => {
                                return uuid_list.length > 0
                                    ? uuid_list
                                          .slice(this.sliceNum, (this.sliceNum += 20))
                                          .map((uuid) => thumbnail$(this.selectedProjectName, uuid))
                                    : [];
                            }),
                        );
                    }),
                    // * this mergeMap responsible for flaten all observable into one layer
                    concatMap((data) => data),
                )
                .subscribe(
                    (res) => {
                        this.thumbnailList = [...this.thumbnailList, res];
                        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
                    },
                    (error: Error) => {
                        /** This is intentional */
                    },
                    () => {
                        this.blockLoadThumbnails = false;
                        this._spinnerService.hideSpinner();
                    },
                );
            // make initial call
            this.subject$.next();
        }
    };

    onToggleTab = ({ name, closed }: TabsProps): void => {
        const isExactTabState: boolean = this.tabStatus.some(
            (tab) => tab.name.toLowerCase() === name.toLowerCase() && tab.closed === closed,
        );
        !isExactTabState &&
            (this.tabStatus = this.tabStatus.map((tab) =>
                tab.name.toLowerCase() === name.toLowerCase() ? { ...tab, closed } : { ...tab },
            ));
    };

    onDisplayShortcutKeyInfo() {
        this._modalService.open(this.modalShortcutKeyInfo);
    }

    onDisplayModal = (id = 'modal-image-labelling') => {
        this.subLabelRegionVal = '';
        this.subLabelValidateMsg = '';
        this._modalService.open(id);
    };

    onCloseModal = (id = 'modal-image-labelling') => {
        this._videoLblActionService.setState({ isActiveModal: false, draw: true, scroll: true });
        this._modalService.close(id);
    };

    onDeleteAnnotation = (index: number) => {
        this.tabStatus = this._videoLblLayoutService.deleteAnnotation(this.tabStatus, index);
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    onLoadMoreThumbnails() {
        this.loadThumbnails();
    }

    onRenameImage(thumbnailInfo: CompleteMetadata) {
        this.getImageNameFromPath(thumbnailInfo);
        this.renameImageErrorCode = -1;
        this._modalService.open(this.modalRenameImage);
        this._renameInput.nativeElement.focus();
    }

    onDeleteImage(thumbnailInfo: CompleteMetadata) {
        if (this.currentAnnotationIndex !== -1) {
            return;
        }
        this.getImageNameFromPath(thumbnailInfo);
        if (!this.dontAskDelete) {
            this._modalService.open(this.modalDeleteImage);
            this._deleteBtn.nativeElement.focus();
            return;
        }
        this.onSubmitDeleteImage();
    }

    onExport = (): void => {
        this.modalSpanMessage = '';
        this.modalSpanLocationPath = '';
        this._modalService.open(this.modalExportOptions);
    };

    displayImage = (
        { thumbnailIndex, ...thumbnail }: EventEmitter_ThumbnailDetails,
        projectName = this.selectedProjectName,
    ): void => {
        if (this.selectedMetaData?.uuid !== thumbnail.uuid) {
            this.showLoading = true;
            const getImage$ = this._videoLblApiService.getBase64Thumbnail(projectName, thumbnail.uuid);
            console.log(projectName);
            getImage$.pipe(first()).subscribe(
                ({ message, img_src }) => {
                    if (message === 1) {
                        this.selectedMetaData = thumbnail;
                        this.imgSrc = img_src;
                        this.currentImageDisplayIndex = thumbnailIndex;

                        const hasAnnotation = thumbnail.bnd_box
                            ? thumbnail.bnd_box.length > 0
                            : (thumbnail.polygons && thumbnail.polygons.length > 0) || false;
                        this.onChangeSchema = {
                            ...this.onChangeSchema,
                            // + 1 to prevent showing photo but info comp shows 0/2 on UI
                            currentThumbnailIndex: thumbnailIndex + 1,
                            thumbnailName: thumbnail.img_path,
                            hasAnnotation,
                        };
                    }
                },
                (err: Error) => console.error(err),
                () => (this.showLoading = false),
            );
        }
    };

    directToFrameNumber = ({ thumbnailIndex, ...thumbnail }: EventEmitter_ThumbnailDetails): void => {
        this.currentImageDisplayIndex = thumbnailIndex;
    };

    onChangeTabAnnotation = (annotation: BboxMetadata & PolyMetadata): void => {
        this.tabStatus.map((tab) => (tab.annotation ? { ...tab, annotation: [annotation] } : tab));
    };

    navigateByAction = ({ thumbnailAction }: EventEmitter_Action): void => {
        if (thumbnailAction) {
            const calculatedIndex = this._videoLblLayoutService.calculateIndex(
                thumbnailAction,
                this.currentImageDisplayIndex,
                this.thumbnailList.length,
            );

            if (calculatedIndex !== this.currentImageDisplayIndex) {
                this.currentImageDisplayIndex = calculatedIndex;
                const filteredThumbMetadata = this.thumbnailList.find((_, i) => i === calculatedIndex);
                const thumbnailIndex = this.thumbnailList.findIndex((_, i) => i === calculatedIndex);
                thumbnailIndex + 3 === this.thumbnailList.length && this.loadThumbnails();
                filteredThumbMetadata &&
                    thumbnailIndex !== -1 &&
                    !this.showLoading &&
                    this.displayImage({ ...filteredThumbMetadata, thumbnailIndex });
            }
        }
    };

    onChangeMetadata = (mutatedMetadata: BboxMetadata & PolyMetadata): void => {
        // console.log(mutatedMetadata);
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation ? { ...tab, annotation: [mutatedMetadata] } : tab,
        );
        // whenever object-detection / segmentation adding new drawing
        // mutate state in thumbnailList to update child comp (project comp)
        this.thumbnailList = this.thumbnailList.map((metadata, i) => {
            return this.currentImageDisplayIndex === i ? mutatedMetadata : metadata;
        });
        // whenever object-detection / segmentation adding new drawing
        // mutate state in onChangeSchema to update child comp (info comp)
        const hasAnnotation = mutatedMetadata.bnd_box
            ? mutatedMetadata.bnd_box.length > 0
            : mutatedMetadata.polygons.length > 0;

        this.onChangeSchema = {
            ...this.onChangeSchema,
            hasAnnotation,
        };
        this.updateProjectProgress();
    };

    updateStateToRenderChild = () => {
        this.tabStatus.forEach(({ annotation }) => {
            if (annotation) {
                // re-render project comp
                this.thumbnailList = this.thumbnailList.map(
                    (thumbnail) =>
                        annotation.find(({ uuid: incomingUuid }) => thumbnail.uuid === incomingUuid) ?? thumbnail,
                );
                // re-render object-detection comp
                this.selectedMetaData = annotation[0];
            }
        });
    };

    onCheckBboxMetadata = () => {
        this.tabStatus.forEach(({ annotation }) => {
            if (annotation) {
                annotation?.forEach((metadata) => {
                    metadata.bnd_box?.forEach((bbox, idx) => {
                        if (bbox.x1 > bbox.x2) {
                            const temp = bbox.x1;
                            bbox.x1 = bbox.x2;
                            bbox.x2 = temp;
                        }
                        if (bbox.y1 > bbox.y2) {
                            const temp = bbox.y1;
                            bbox.y1 = bbox.y2;
                            bbox.y2 = temp;
                        }
                    });
                });
            }
        });
    };

    onChangeAnnotationLabel = (changeAnnoLabel: ChangeAnnotationLabel): void => {
        changeAnnoLabel.index = this.currentAnnotationIndex;
        if (this.selectedMetaData) {
            if (this.selectedMetaData.polygons) {
                this.selectedMetaData.polygons[changeAnnoLabel.index].label = changeAnnoLabel.label;
                this.currentAnnotationLabel = changeAnnoLabel.label;
            }
        }
        this.tabStatus = this._videoLblLayoutService.changeAnnotationLabel(this.tabStatus, changeAnnoLabel);
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    updateProjectProgress = (): void => {
        const projectName = this.selectedProjectName;
        this.onCheckBboxMetadata();
        this._videoLblLayoutService.updateProjectProgress(this.tabStatus, projectName);
    };

    onProcessLabel = ({ selectedLabel, label_list, action }: SelectedLabelProps) => {
        const newLabelList: string[] =
            selectedLabel && !action ? label_list.filter((label) => label !== selectedLabel) : label_list;
        const projectName: string = this.selectedProjectName;
        const updateLabel$ = this._videoLblApiService.updateLabelList(
            projectName,
            newLabelList.length > 0 ? newLabelList : [],
        );

        updateLabel$.pipe(first()).subscribe(({ message }) => {
            if (message === 1) {
                this.tabStatus = this._videoLblLayoutService.displayLabelList(this.tabStatus, newLabelList);
            } else {
                console.error(`Error while updating label`);
            }
        });

        this.updateProjectProgress();
    };

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key, repeat }: KeyboardEvent): void => {
        if (!this.selectedMetaData || this._modalService.isOpened()) {
            return;
        }
        const thumbnailInfo = this.selectedMetaData;
        switch (key) {
            case 'ArrowLeft':
                this._videoLblActionService.action$.pipe(first()).subscribe(({ draw }) => {
                    if (!draw && !repeat) {
                        this.navigateByAction({ thumbnailAction: -1 });
                    }
                });
                break;
            case 'ArrowRight':
                this._videoLblActionService.action$.pipe(first()).subscribe(({ draw }) => {
                    if (!draw && !repeat) {
                        this.navigateByAction({ thumbnailAction: 1 });
                    }
                });
                break;
            case 'F2':
                this.getImageNameFromPath(thumbnailInfo);
                this.renameImageErrorCode = -1;
                this._modalService.open(this.modalRenameImage);
                this._renameInput.nativeElement.focus();
                break;
            case 'Delete':
                if (this.currentAnnotationIndex !== -1) {
                    break;
                }
                this.getImageNameFromPath(thumbnailInfo);
                if (!this.dontAskDelete) {
                    this._modalService.open(this.modalDeleteImage);
                    this._deleteBtn.nativeElement.focus();
                    break;
                }
                this.onSubmitDeleteImage();
                break;
            default:
                break;
        }
    };

    getImageNameFromPath(thumbnailInfo: CompleteMetadata) {
        this.imgPath = thumbnailInfo.img_path;
        let separater = '';
        const platform = window.navigator.platform;
        if (platform.startsWith('Mac') || platform.startsWith('Linux')) {
            separater = '/';
        } else {
            separater = '\\';
        }
        this.imgPathSplit = this.imgPath.split(separater);
        const imageName = this.imgPathSplit.pop();
        this.newImageName = imageName ? imageName.split('.')[0] : '';
        this.imageExt = imageName ? '.' + imageName.split('.').pop() : '';
        this.selectedUuid = thumbnailInfo.uuid;
    }

    onSubmitDeleteImage() {
        this._videoLblApiService
            .deleteImage(this.selectedUuid, this.imgPath, this.selectedProjectName)
            .subscribe((res) => {
                if (res.message === 1) {
                    this.thumbnailList = this.thumbnailList.filter((x) => res.uuid_list.includes(x.uuid));
                    this.totalUuid = res.uuid_list.length;
                    if (this.onChangeSchema.currentThumbnailIndex === this.totalUuid + 1) {
                        this.onChangeSchema.currentThumbnailIndex--;
                        this.currentImageDisplayIndex--;
                        this.displayOtherImgAfterDelete();
                    } else {
                        this.displayOtherImgAfterDelete();
                    }
                    this.sliceNum--;
                    if (this.thumbnailList.length < 15) {
                        this.onLoadMoreThumbnails();
                    }
                    this._modalService.close(this.modalDeleteImage);
                }
            });
    }

    displayOtherImgAfterDelete() {
        const filteredThumbMetadata = this.thumbnailList.find((_, i) => i === this.currentImageDisplayIndex);
        const thumbnailIndex = this.thumbnailList.findIndex((_, i) => i === this.currentImageDisplayIndex);
        thumbnailIndex + 3 === this.thumbnailList.length && this.loadThumbnails();
        filteredThumbMetadata &&
            thumbnailIndex !== -1 &&
            !this.showLoading &&
            this.displayImage({ ...filteredThumbMetadata, thumbnailIndex });
    }

    /** @event fires whenever browser is closing */
    @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: BeforeUnloadEvent): void {
        this.resetProjectStatus();
        event.preventDefault();
    }

    resetProjectStatus = (projectName = this.selectedProjectName) => {
        // prevents when comp destroyed yet still sending empty string to service
        projectName.trim() &&
            this._videoDataSetService
                .manualCloseProject(projectName)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ message }) => {
                    this._router.navigate(['/']);
                });
    };

    exportProject = (exportType: string): void => {
        exportType === 'cfgdata' && this.processingNum++;
        const projectName = this.selectedProjectName;
        const exportProject$ = this._videoLblApiService.exportProject(projectName, exportType);
        const exportProjectStatus$ = this._videoLblApiService.exportProjectStatus();

        const returnResponse = ({ message }: Message): Observable<ExportStatus> => {
            return message === 1
                ? interval(500).pipe(
                      concatMap(() => exportProjectStatus$),
                      first(({ export_status }) => {
                          this.isOverlayOn = export_status === 1 ? true : false;
                          this.isLoading = export_status === 1 ? true : false;
                          return export_status === 0 || export_status === 2 || export_status === 3;
                      }),
                  )
                : throwError((error: any) => {
                      console.error(error);
                      return error;
                  });
        };
        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                mergeMap(() => exportProject$),
                mergeMap((message) => returnResponse(message)),
            )
            .subscribe(
                ({ export_status, project_config_path }) => {
                    exportType === 'cfgdata' && this.processingNum--;
                    if (export_status === 2) {
                        this._languageService._translate.get('exportSuccess').subscribe((translated) => {
                            this.toggleExportProjectModalMessage(true);
                            this.modalSpanMessage = projectName + translated;
                            this.modalSpanLocationPath = project_config_path;
                            this.processIsSuccess(true);
                        });
                    } else {
                        this._languageService._translate.get('exportFailed').subscribe((translated) => {
                            this.toggleExportProjectModalMessage(true);
                            this.modalSpanMessage = translated + projectName;
                            this.processIsSuccess(false);
                        });
                    }
                },
                (error: Error) => {
                    /** This is intentional */
                },
                () => {
                    this.closeExportProjectModal();
                },
            );

        // make initial call
        this.subject$.next();
    };

    toggleExportProjectModalMessage = (open: boolean): void => {
        if (open) {
            this._modalService.open(this.modalExportProject);
        } else {
            this._modalService.close(this.modalExportProject);
        }
    };

    processIsSuccess = (success: boolean): void => {
        if (success) {
            this.spanClass = 'validation-success';
        } else {
            this.spanClass = 'validation-error';
        }
    };

    closeExportProjectModal() {
        this._modalService.close(this.modalExportOptions);
    }

    onReload = (): void => {
        const projectName = this.selectedProjectName;
        const reloadProject$ = this._videoLblApiService.reloadProject(projectName);
        const reloadStatus$ = this._videoLblApiService.reloadProjectStatus(projectName);
        const thumbnail$ = this._videoDataSetService.getThumbnailList;
        const thumbnailListTemp: CompleteMetadata[] = [];

        const returnResponse = ({ message }: Message): Observable<BboxMetadata & PolyMetadata> => {
            return message !== 5 && message === 1
                ? interval(500).pipe(
                      mergeMap(() => reloadStatus$),
                      /** @property {number} message value 4 means upload completed, value 1 means cancelled */
                      first(({ file_system_status, unsupported_image_list }) => {
                          this.unsupportedImageList = unsupported_image_list;
                          return file_system_status === 3 || file_system_status === 0;
                      }),
                      concatMap((res) => {
                          /** @property {number} message if value 4 means client has received uploaded item(s) */
                          this.isLoading = true;
                          let listTemp: string[] = [];
                          this.thumbnailList.forEach((element) => {
                              listTemp.push(element.uuid);
                          });
                          res.uuid_add_list.forEach((uuid) => {
                              listTemp.push(uuid);
                              this.totalUuid++;
                          });
                          res.uuid_delete_list.forEach((uuid) => {
                              listTemp = listTemp.filter((e) => e !== uuid);
                              this.totalUuid--;
                          });
                          this.sliceNum = 0;
                          const thumbnails =
                              res.file_system_status === 3 && listTemp.length > 0
                                  ? listTemp
                                        .slice(this.sliceNum, (this.sliceNum += 20))
                                        .map((uuid) => thumbnail$(projectName, uuid))
                                  : [];

                          this.thumbnailList = [];
                          return thumbnails;
                      }),
                      // * this mergeMap responsible for flaten all observable into one layer
                      mergeMap((data) => data),
                  )
                : throwError((error: any) => {
                      console.error(error);
                      this.isLoading = false;
                      return error;
                  });
        };
        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                mergeMap(() => reloadProject$),
                mergeMap((val) => returnResponse(val)),
            )
            .subscribe(
                (res) => {
                    this.isLoading = true;
                    thumbnailListTemp.push(res);
                },
                (error: Error) => {
                    /** This is intentional */
                },
                () => {
                    this.thumbnailList = thumbnailListTemp;
                    this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
                    this.currentImageDisplayIndex = -1;
                    this.navigateByAction({ thumbnailAction: 1 });
                    this.isLoading = false;
                    this.unsupportedImageList.length > 0 &&
                        this._videoDataSetService
                            .downloadUnsupportedImageList(projectName, this.unsupportedImageList)
                            .then((res) => {
                                res && this._modalService.open(this.modalUnsupportedImage);
                            });
                },
            );

        // make initial call
        this.subject$.next();
    };

    navigateByUrl = ({ url }: EventEmitter_Url): void => {
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    onChangeInput = (event: HTMLElementEvent<HTMLTextAreaElement>, type: 'main' | 'sub') => {
        const { value } = event.target;
        if (type === 'main') {
            this.mainLabelRegionVal = value;
        } else {
            this.subLabelRegionVal = value;
        }
    };

    onSubmitLabel = () => {
        const { value } = this._subLabelSelect.nativeElement;
        if (!value.trim()) {
            return;
        }
        let isPreExistSubLabel: boolean = false;
        let isDupSubLabel: boolean = false;

        this.tabStatus.forEach(({ annotation }) =>
            annotation?.forEach(({ bnd_box, polygons }) => {
                const dynamicProp = bnd_box ?? polygons;
                if (dynamicProp) {
                    const { subLabel } = dynamicProp[this.currentAnnotationIndex];
                    isPreExistSubLabel = subLabel && subLabel?.length > 0 ? true : false;
                    isPreExistSubLabel && subLabel?.some(({ label }) => (isDupSubLabel = label === value));
                } else {
                    console.log('missing prop bnd_box OR polygons');
                }
            }),
        );

        if (this.currentAnnotationLabel === value) {
            isDupSubLabel = true;
        }

        if (!isDupSubLabel) {
            this.tabStatus = this._videoLblLayoutService.submitLabel(
                this.tabStatus,
                value,
                this.currentAnnotationIndex,
                {
                    mainLabelRegion: this.mainLabelRegionVal,
                    subLabelRegion: this.subLabelRegionVal,
                },
            );
            this.subLabelValidateMsg = '';
            this.updateStateToRenderChild();
            this.updateProjectProgress();
        } else {
            this.subLabelValidateMsg = `Invalid of duplicate label: ${value}`;
        }
        this.subLabelRegionVal = '';
    };

    onRemoveSubLabel = (selectedAnnoIndex: number, selectedSubLabelIndex: number) => {
        this.tabStatus = this._videoLblLayoutService.removeSubLabel(this.tabStatus, {
            selectedAnnoIndex,
            selectedSubLabelIndex,
        });
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    onSwitchSaveType = () => {
        this.saveType = {
            saveCurrentImage: !this.saveType.saveCurrentImage,
            saveBulk: !this.saveType.saveBulk,
        };
    };

    onClickDownload = async (saveFormat: SaveFormat) => {
        const labelList = this.labelChoosen.filter((e) => e.isChoosen === true).map((e) => e.label);
        const fullLabelList = this.labelChoosen.map((e) => e.label);
        this.saveType.saveBulk && this.processingNum++;
        const response: ProcessResponse = await this._exportSaveFormatService.exportSaveFormat({
            ...this.saveType,
            saveFormat,
            metadata: this.selectedMetaData,
            index: this.currentAnnotationIndex,
            projectName: this.selectedProjectName,
            fullLabelList,
            ...((this.saveType.saveBulk || saveFormat === 'ocr' || saveFormat === 'json' || saveFormat === 'coco') && {
                projectFullMetadata: this.thumbnailList,
            }),
            ...(saveFormat !== 'json' && {
                labelList,
            }),
        });

        /**
         * Response Message:
         * 0 - isEmpty/Warning
         * 1 - Success/Done
         */

        if (response.message === 0) {
            this.warningMessage = response.msg;
            this._modalService.open(this.modalExportWarning);
        }
        this.saveType.saveBulk && this.processingNum--;
    };

    onChangeLabel(value: string) {
        const changeAnnotationLabel: ChangeAnnotationLabel = {
            index: this.currentAnnotationIndex,
            label: value,
        };
        this.onChangeAnnotationLabel(changeAnnotationLabel);
    }

    onChangeImageName(event: HTMLElementEvent<HTMLInputElement>) {
        this.newImageName = event.target.value;
    }

    onSubmitRenameImage() {
        if (this.newImageName === '') {
            this.renameImageErrorCode = 3;
            return;
        }
        this._videoLblApiService
            .renameImage(this.selectedUuid, this.newImageName + this.imageExt, this.selectedProjectName)
            .subscribe((res) => {
                if (res.message === 1) {
                    const index = this.thumbnailList.findIndex((t) => t.uuid === this.selectedUuid);
                    let separater = '';
                    const platform = window.navigator.platform;
                    if (platform.startsWith('Mac') || platform.startsWith('Linux')) {
                        separater = '/';
                    } else {
                        separater = '\\';
                    }

                    this.thumbnailList[index].img_path =
                        this.imgPathSplit.join(separater) + separater + this.newImageName + this.imageExt;

                    this.newImageName = '';
                    this._modalService.close(this.modalRenameImage);
                } else {
                    if (res.error_code !== 3) {
                        this.renameImageErrorCode = res.error_code;
                    }
                }
            });
    }

    showAdvSettings() {
        this.tempLabelChoosen = this.labelChoosen.map((x) => Object.assign({}, x));
        this.onDisplayModal('modal-adv');
    }

    saveAdvSettings() {
        this.labelChoosen = this.tempLabelChoosen.map((x) => Object.assign({}, x));
        this.onCloseModal('modal-adv');
    }

    shortcutKeyInfo() {
        return [
            {
                no: 1,
                shortcutKey: `info.shortcut.1.key`,
                functionality: `info.shortcut.1.functionality`,
            },
            {
                no: 2,
                shortcutKey: `info.shortcut.2.key`,
                functionality: `info.shortcut.2.functionality`,
            },
            {
                no: 3,
                shortcutKey: `info.shortcut.3.key`,
                functionality: `info.shortcut.3.functionality`,
            },
            {
                no: 4,
                shortcutKey: `info.shortcut.4.key`,
                functionality: `info.shortcut.4.functionality`,
            },
            {
                no: 5,
                shortcutKey: `info.shortcut.5.key`,
                functionality: `info.shortcut.5.functionality`,
            },
            {
                no: 6,
                shortcutKey: `info.shortcut.6.key`,
                functionality: `info.shortcut.6.functionality`,
            },
            {
                no: 7,
                shortcutKey: `info.shortcut.7.key`,
                functionality: `info.shortcut.7.functionality`,
            },
            {
                no: 8,
                shortcutKey: `info.shortcut.8.key`,
                functionality: `info.shortcut.8.functionality`,
            },
        ];
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this._videoLblModeService.setState(null);
        this._videoLblActionService.setState(null);
        this.resetProjectStatus();
    }
}
