/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { AnnotateSelectionService } from 'shared/services/annotate-selection.service';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutService } from 'layouts/data-set-layout/data-set-layout-api.service';
import {
    ExportSaveFormatService,
    ExportSaveType,
    SaveFormat,
    ProcessResponse,
} from 'shared/services/export-save-format.service';
import { first, mergeMap, takeUntil } from 'rxjs/operators';
import { HTMLElementEvent } from 'shared/types/field/field.model';
import { ImageLabellingActionService } from 'components/image-labelling/image-labelling-action.service';
import { ImageLabellingApiService } from 'components/image-labelling/image-labelling-api.service';
import { ImageLabellingLayoutService } from 'layouts/image-labelling-layout/image-labelling-layout.service';
import { ImageLabellingModeService } from 'components/image-labelling/image-labelling-mode.service';
import { LanguageService } from 'shared/services/language.service';
import { ModalService } from 'shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'shared/components/spinner/spinner.service';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { AddImageResponse, ExportStatus, labels_stats, Message } from 'shared/types/message/message.model';
import { ModalBodyStyle } from 'shared/types/modal/modal.model';
import { ChartProps, ProjectSchema } from 'shared/types/dataset-layout/data-set-layout.model';
import {
    ImgLabelProps,
    ImageLabelUrl,
    CompleteMetadata,
    TabsProps,
    AddSubLabel,
    LabelChoosen,
    BboxMetadata,
    PolyMetadata,
    EventEmitter_Url,
    EventEmitter_Action,
    EventEmitter_ThumbnailDetails,
    SelectedLabelProps,
    ChangeAnnotationLabel,
} from 'shared/types/image-labelling/image-labelling.model';
import { LabelColorServices } from '../../shared/services/label-color.services';

@Component({
    selector: 'image-labelling-layout',
    templateUrl: './image-labelling-layout.component.html',
    styleUrls: ['./image-labelling-layout.component.scss'],
})
export class ImageLabellingLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: ImgLabelProps;
    currentUrl: ImageLabelUrl = '';
    selectedProjectName: string = '';
    imgSrc: string = '';
    loading: boolean = false;
    thumbnailList: CompleteMetadata[] = [];
    selectedMetaData?: CompleteMetadata;
    unsubscribe$: Subject<any> = new Subject();
    subject$: Subject<any> = new Subject();
    subjectSubscription?: Subscription;
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
    labelledImage: number = 0;
    unLabelledImage: number = 0;
    labelStats: ChartProps[] = [];
    isFetching: boolean = true;
    noLabel: boolean = true;
    noAnnotation: boolean = true;
    tabClosedStatus!: TabsProps;
    imageNameList: string[] = [];
    imageBase64List: string[] = [];
    selectedFiles!: FileList;
    isSelectedImagesAdding: boolean = false;
    imageLoading: boolean = false;
    totalImage!: number;
    progress: string = '';
    clickAbilityToggle!: boolean;
    refreshAllLabelColor: boolean = false;
    readonly modalExportOptions = 'modal-export-options';
    readonly modalExportProject = 'modal-export-project';
    readonly modalShortcutKeyInfo = 'modal-shortcut-key-info';
    readonly modalUnsupportedImage = 'modal-unsupported-image';
    readonly modalExportWarning = 'modalExportWarning';
    readonly modalRenameImage = 'modal-rename-image';
    readonly modalDeleteImage = 'modal-delete-image';
    readonly modalIdProjectStats = 'modal-project-stats';
    readonly modalAddImage = 'modal-add-image';
    readonly modalSubmitAddedImage = 'modal-submit-added-image';
    readonly modalImageLoadingProgress = 'modal-image-loading-progress';
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
    projectStatsBodyStyle: ModalBodyStyle = {
        minHeight: '50vh',
        minWidth: '50vw',
        maxWidth: '50vw',
        margin: '7vw 36vh',
        overflow: 'none',
    };
    addImageBodyStyle: ModalBodyStyle = {
        height: '73vh',
        width: '83vw',
        margin: '5vw 5vh',
        overflowY: 'none',
    };
    submitAddedImageBodyStyle: ModalBodyStyle = {
        height: '27vh',
        width: '30vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    imageLoadingProgressBodyStyle: ModalBodyStyle = {
        minHeight: '18vh',
        maxHeight: '30vh',
        minWidth: '20vw',
        maxWidth: '20vw',
        margin: '15vw 71vh',
        overflow: 'none',
        background: 'none',
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
        private _imgLblApiService: ImageLabellingApiService,
        private _modalService: ModalService,
        private _dataSetService: DataSetLayoutService,
        private _annotateService: AnnotateSelectionService,
        private _imgLblActionService: ImageLabellingActionService,
        private _imgLblLayoutService: ImageLabellingLayoutService,
        private _imgLblModeService: ImageLabellingModeService,
        public _languageService: LanguageService,
        private _spinnerService: SpinnerService,
        private _exportSaveFormatService: ExportSaveFormatService,
        private _labelColorService: LabelColorServices,
    ) {
        const langsArr: string[] = ['image-labelling-en', 'image-labelling-cn', 'image-labelling-ms'];
        this._languageService.initializeLanguage(`image-labelling`, langsArr);
    }

    ngOnInit(): void {
        this.currentUrl = this._router.url as ImageLabelUrl;
        const { projectName } = this._imgLblLayoutService.getRouteState(history);
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
        this.startProject(this.selectedProjectName);
    }

    startProject = (projectName: string): void => {
        this.isLoading = true;
        this.selectedProjectName = projectName;
        const projMetaStatus$ = this._dataSetService.checkProjectStatus(projectName);
        const updateProjLoadStatus$ = this._dataSetService.updateProjectLoadStatus(projectName);
        const projLoadingStatus$ = this._dataSetService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;

        this.subjectSubscription = this.subject$
            .pipe(
                mergeMap(() => forkJoin([projMetaStatus$])),
                first(([{ message, content }]) => {
                    this.totalUuid = content[0].total_uuid;
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
                mergeMap(([{ message }]) => (!message ? [] : forkJoin([updateProjLoadStatus$, projLoadingStatus$]))),
                mergeMap(([{ message: updateProjStatus }, { message: loadProjStatus, uuid_list, label_list }]) => {
                    if (loadProjStatus === 2) {
                        this.labelList = [...label_list];
                        this.tabStatus[1].label_list = this.labelList;
                        return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
                    } else {
                        return interval(500).pipe(
                            mergeMap(() => projLoadingStatus$),
                            first(({ message }) => message === 2),
                            mergeMap((labelList) => {
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
                mergeMap((data) => data),
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
                                this._imgLblActionService.setState({
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
                    this._imgLblActionService.action$
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
            const projLoadingStatus$ = this._dataSetService.checkExistProjectStatus(this.selectedProjectName);
            const thumbnail$ = this._dataSetService.getThumbnailList;

            this.subjectSubscription = this.subject$
                .pipe(
                    first(),
                    mergeMap(() => {
                        return interval(500).pipe(
                            mergeMap(() => projLoadingStatus$),
                            first(({ message }) => message === 2),
                            mergeMap(({ uuid_list }) => {
                                return uuid_list.length > 0
                                    ? uuid_list
                                          .slice(this.sliceNum, (this.sliceNum += 20))
                                          .map((uuid) => thumbnail$(this.selectedProjectName, uuid))
                                    : [];
                            }),
                        );
                    }),
                    // * this mergeMap responsible for flaten all observable into one layer
                    mergeMap((data) => data),
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

    updateProjectProgress = (): void => {
        const projectName = this.selectedProjectName;
        this.onCheckBboxMetadata();
        this._imgLblLayoutService.updateProjectProgress(this.tabStatus, projectName);
    };

    onChangeMetadata = (mutatedMetadata: BboxMetadata & PolyMetadata): void => {
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

    onToggleTab = ({ name, closed }: TabsProps): void => {
        const isExactTabState: boolean = this.tabStatus.some(
            (tab) => tab.name.toLowerCase() === name.toLowerCase() && tab.closed === closed,
        );
        !isExactTabState &&
            (this.tabStatus = this.tabStatus.map((tab) =>
                tab.name.toLowerCase() === name.toLowerCase() ? { ...tab, closed } : { ...tab },
            ));

        this.tabClosedStatus = { name, closed };
    };

    onExport = (): void => {
        this.modalSpanMessage = '';
        this.modalSpanLocationPath = '';
        this._modalService.open(this.modalExportOptions);
    };

    exportProject = (exportType: string): void => {
        exportType === 'cfgdata' && this.processingNum++;
        const projectName = this.selectedProjectName;
        const exportProject$ = this._imgLblApiService.exportProject(projectName, exportType);
        const exportProjectStatus$ = this._imgLblApiService.exportProjectStatus();

        const returnResponse = ({ message }: Message): Observable<ExportStatus> => {
            return message === 1
                ? interval(500).pipe(
                      mergeMap(() => exportProjectStatus$),
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
        const reloadProject$ = this._imgLblApiService.reloadProject(projectName);
        const reloadStatus$ = this._imgLblApiService.reloadProjectStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;
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
                      mergeMap((res) => {
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

    navigateByUrl = ({ url }: EventEmitter_Url): void => {
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key, repeat }: KeyboardEvent): void => {
        if (!this.selectedMetaData || this._modalService.isOpened()) {
            return;
        }
        const thumbnailInfo = this.selectedMetaData;
        switch (key) {
            case 'ArrowLeft':
                this._imgLblActionService.action$.pipe(first()).subscribe(({ draw }) => {
                    if (!draw && !repeat) {
                        this.navigateByAction({ thumbnailAction: -1 });
                    }
                });
                break;
            case 'ArrowRight':
                this._imgLblActionService.action$.pipe(first()).subscribe(({ draw }) => {
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
        const platform = window.navigator.userAgent;
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

    navigateByAction = ({ thumbnailAction }: EventEmitter_Action): void => {
        if (thumbnailAction) {
            const calculatedIndex = this._imgLblLayoutService.calculateIndex(
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

    displayImage = (
        { thumbnailIndex, ...thumbnail }: EventEmitter_ThumbnailDetails,
        projectName = this.selectedProjectName,
    ): void => {
        if (this.selectedMetaData?.uuid !== thumbnail.uuid) {
            this.showLoading = true;
            const getImage$ = this._imgLblApiService.getBase64Thumbnail(projectName, thumbnail.uuid);

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
        // if (this.selectedMetaData?.polygons !== undefined) {
        //     const labelColorList = this._labelColorService.getLabelColorList(this.selectedProjectName);
        //     this.selectedMetaData.polygons = this.selectedMetaData.polygons.map((poly) => ({
        //         ...poly,
        //         color: labelColorList.get(poly.label) as string
        //     }));
        // }
    };

    onProcessLabel = ({ selectedLabel, label_list, action }: SelectedLabelProps) => {
        const newLabelList: string[] =
            selectedLabel && !action ? label_list.filter((label) => label !== selectedLabel) : label_list;
        const projectName: string = this.selectedProjectName;
        const updateLabel$ = this._imgLblApiService.updateLabelList(
            projectName,
            newLabelList.length > 0 ? newLabelList : [],
        );

        updateLabel$.pipe(first()).subscribe(({ message }) => {
            if (message === 1) {
                this.tabStatus = this._imgLblLayoutService.displayLabelList(this.tabStatus, newLabelList);
            } else {
                console.error(`Error while updating label`);
            }
        });

        this.updateProjectProgress();
    };

    onChangeAnnotationLabel = (changeAnnoLabel: ChangeAnnotationLabel): void => {
        changeAnnoLabel.index = this.currentAnnotationIndex;
        const labelColorList = this._labelColorService.getLabelColorList(this.selectedProjectName);
        if (this.selectedMetaData) {
            if (this.selectedMetaData.polygons) {
                this.selectedMetaData.polygons[changeAnnoLabel.index].label = changeAnnoLabel.label;
                this.selectedMetaData.polygons[changeAnnoLabel.index].color = labelColorList.get(
                    changeAnnoLabel.label,
                ) as string;
                this.currentAnnotationLabel = changeAnnoLabel.label;
            }

            if (this.selectedMetaData.bnd_box) {
                this.selectedMetaData.bnd_box[changeAnnoLabel.index].color = labelColorList.get(
                    changeAnnoLabel.label,
                ) as string;
            }
        }
        this.tabStatus = this._imgLblLayoutService.changeAnnotationLabel(this.tabStatus, changeAnnoLabel);
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    onDeleteAnnotation = (index: number) => {
        this.tabStatus = this._imgLblLayoutService.deleteAnnotation(this.tabStatus, index);
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    onDisplayModal = (id = 'modal-image-labelling') => {
        this.subLabelRegionVal = '';
        this.subLabelValidateMsg = '';
        this._modalService.open(id);
    };

    onCloseModal = (id = 'modal-image-labelling') => {
        this._imgLblActionService.setState({ isActiveModal: false, draw: true, scroll: true });
        this._modalService.close(id);
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
            this.tabStatus = this._imgLblLayoutService.submitLabel(this.tabStatus, value, this.currentAnnotationIndex, {
                mainLabelRegion: this.mainLabelRegionVal,
                subLabelRegion: this.subLabelRegionVal,
            });
            this.subLabelValidateMsg = '';
            this.updateStateToRenderChild();
            this.updateProjectProgress();
        } else {
            this.subLabelValidateMsg = `Invalid of duplicate label: ${value}`;
        }
        this.subLabelRegionVal = '';
    };

    onRemoveSubLabel = (selectedAnnoIndex: number, selectedSubLabelIndex: number) => {
        this.tabStatus = this._imgLblLayoutService.removeSubLabel(this.tabStatus, {
            selectedAnnoIndex,
            selectedSubLabelIndex,
        });
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    /** @function responsible for updating state to re-render child comp(s) */
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

    /** @event fires whenever browser is closing */
    @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: BeforeUnloadEvent): void {
        this.resetProjectStatus();
        event.preventDefault();
    }

    resetProjectStatus = (projectName = this.selectedProjectName) => {
        // prevents when comp destroyed yet still sending empty string to service
        projectName.trim() &&
            this._dataSetService
                .manualCloseProject(projectName)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ message }) => {
                    this._router.navigate(['/']);
                });
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

    onDisplayShortcutKeyInfo() {
        this._modalService.open(this.modalShortcutKeyInfo);
    }

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

    onChangeImageName(event: HTMLElementEvent<HTMLInputElement>) {
        this.newImageName = event.target.value;
    }

    onSubmitRenameImage() {
        if (this.newImageName === '') {
            this.renameImageErrorCode = 3;
            return;
        }
        this._imgLblApiService
            .renameImage(this.selectedUuid, this.newImageName + this.imageExt, this.selectedProjectName)
            .subscribe((res) => {
                if (res.message === 1) {
                    const index = this.thumbnailList.findIndex((t) => t.uuid === this.selectedUuid);
                    let separater = '';
                    const platform = window.navigator.userAgent;
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

    onSubmitDeleteImage() {
        this._imgLblApiService
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

    showAdvSettings() {
        this.tempLabelChoosen = this.labelChoosen.map((x) => Object.assign({}, x));
        this.onDisplayModal('modal-adv');
    }

    saveAdvSettings() {
        this.labelChoosen = this.tempLabelChoosen.map((x) => Object.assign({}, x));
        this.onCloseModal('modal-adv');
    }

    toggleProjectStats = (): void => {
        this.noLabel = false;
        this.noAnnotation = true;
        this._dataSetService
            .getProjectStats(this.selectedProjectName)
            .pipe()
            .subscribe((project) => {
                console.log(project);
                if (project) {
                    this.labelledImage = project.labeled_image;
                    this.unLabelledImage = project.unlabeled_image;
                    this.labelStats = [];
                    project.label_per_class_in_project.forEach((labelMeta: labels_stats) => {
                        if (labelMeta.count > 0) {
                            this.noAnnotation = false;
                        }
                        const meta = {
                            name: labelMeta.label,
                            value: labelMeta.count,
                        };
                        this.labelStats.push(meta);
                    });
                    if (project.label_per_class_in_project.length === 0) {
                        this.noLabel = true;
                        this.noAnnotation = false;
                    }
                    this.isFetching = false;
                    this._modalService.open(this.modalIdProjectStats);
                }
            });
    };

    toggleAddImage() {
        this._modalService.open(this.modalAddImage);
    }

    toggleSubmitAddedImage() {
        this._modalService.open(this.modalSubmitAddedImage);
    }

    onCloseAddImageModal() {
        this.imageNameList.splice(0, this.imageNameList.length);
        this.imageBase64List.splice(0, this.imageBase64List.length);
    }

    addNewImages(event: any) {
        this.selectedFiles = event.target.files;
        this.totalImage = this.selectedFiles.length;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i <= this.selectedFiles.length; i++) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    if (!this.imageBase64List.includes(reader.result as string)) {
                        this.imageBase64List.push(reader.result as string);
                    }

                    if (!this.imageNameList.includes(this.selectedFiles[i].name)) {
                        this.imageNameList.push(this.selectedFiles[i].name);
                    }
                    this.imageLoadingProgress(this.imageBase64List.length, this.totalImage);
                }
            };

            if (this.selectedFiles[i]) {
                reader.readAsDataURL(this.selectedFiles[i]);
            }
        }
    }

    imageLoadingProgress(currentIndex: number, totalImage: number) {
        this._modalService.open(this.modalImageLoadingProgress);

        this.progress = ((currentIndex / totalImage) * 100).toFixed(0).trim() + '%';
        this.imageLoading = currentIndex < this.totalImage;

        if (currentIndex === this.totalImage) {
            this.totalImage = 0;
            this._modalService.close(this.modalImageLoadingProgress);
        }
    }

    deleteSelectedImage(index: number) {
        this.imageNameList.splice(index, 1);
        this.imageBase64List.splice(index, 1);
    }

    submitAddedImages() {
        this._modalService.close(this.modalSubmitAddedImage);
        this._modalService.close(this.modalAddImage);
        this.isOverlayOn = true;
        this.isSelectedImagesAdding = true;

        const addImage$ = this._imgLblApiService.submitSelectedImageFile(
            this.selectedProjectName,
            this.imageNameList,
            this.imageBase64List,
        );

        const addImageResponse$ = this._imgLblApiService.addImagesStatus(this.selectedProjectName);

        const returnResponse = ({ message }: Message): Observable<AddImageResponse> => {
            return message === 1
                ? interval(500).pipe(
                      mergeMap(() => addImageResponse$),
                      first(({ add_image_status }) => {
                          return add_image_status === 0 || add_image_status === 1;
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
                mergeMap(() => addImage$),
                mergeMap((response) => returnResponse(response)),
            )
            .subscribe(
                (response) => {
                    if (response.add_image_status === 0) {
                        this.onCloseAddImageModal();
                    }

                    if (response.add_image_status === 1) {
                        this.onCloseAddImageModal();
                        console.log('Operation add image to project folder failed');
                    }
                },
                () => {
                    console.error('Error happened in add image operation, check log for information');
                },
                () => {
                    this.isOverlayOn = false;
                    this.isSelectedImagesAdding = false;
                    this.onReload();
                },
            );

        this.subject$.next();
    }

    changeClickAbilityToggleStatus(status: boolean) {
        this.clickAbilityToggle = status;
    }

    refreshLabelColor() {
        this.refreshAllLabelColor = true;
    }

    completeRefreshLabelColor() {
        this.refreshAllLabelColor = false;
    }

    refreshAllPolygonsLabelColorAndRegion() {
        const idMap = new Map<number, number[]>();
        const labelColorList = this._labelColorService.getLabelColorList(this.selectedProjectName);

        for (const [i, { polygons }] of this.thumbnailList.entries()) {
            if (polygons !== undefined) {
                let idList: number[] = [];
                for (const [_, { id }] of polygons.entries()) {
                    idList.push(id);
                }
                idMap.set(i, idList);
                idList = [];
            }
        }
        for (const [j, { polygons }] of this.thumbnailList.entries()) {
            if (polygons !== undefined) {
                const idList = idMap.get(j);
                if (idList !== undefined) {
                    this.thumbnailList[j].polygons = polygons.map((poly) => ({
                        ...poly,
                        color: labelColorList.get(poly.label) as string,
                        region: String(idList.indexOf(poly.id) + 1),
                    }));
                }
            }
        }
    }

    refreshAllBndBoxLabelColor() {
        const labelColorList = this._labelColorService.getLabelColorList(this.selectedProjectName);

        for (const [i, { bnd_box }] of this.thumbnailList.entries()) {
            if (bnd_box !== undefined) {
                this.thumbnailList[i].bnd_box = bnd_box.map((box) => ({
                    ...box,
                    color: labelColorList.get(box.label) as string,
                }));
            }
        }
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
            {
                no: 9,
                shortcutKey: `info.shortcut.9.key`,
                functionality: `info.shortcut.9.functionality`,
            },
            {
                no: 10,
                shortcutKey: `info.shortcut.10.key`,
                functionality: `info.shortcut.10.functionality`,
            },
            {
                no: 11,
                shortcutKey: `info.shortcut.11.key`,
                functionality: `info.shortcut.11.functionality`,
            },
            {
                no: 12,
                shortcutKey: `info.shortcut.12.key`,
                functionality: `info.shortcut.12.functionality`,
            },
            {
                no: 13,
                shortcutKey: `info.shortcut.13.key`,
                functionality: `info.shortcut.13.functionality`,
            },
            {
                no: 14,
                shortcutKey: `info.shortcut.14.key`,
                functionality: `info.shortcut.14.functionality`,
            },
            {
                no: 15,
                shortcutKey: `info.shortcut.15.key`,
                functionality: `info.shortcut.15.functionality`,
            },
        ];
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this._imgLblModeService.setState(null);
        this._imgLblActionService.setState(null);
        this.resetProjectStatus();
    }
}
