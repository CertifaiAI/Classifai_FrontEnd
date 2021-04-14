import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { first, mergeMap, takeUntil } from 'rxjs/operators';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingActionService } from 'src/components/image-labelling/image-labelling-action.service';
import { ImageLabellingApiService } from 'src/components/image-labelling/image-labelling-api.service';
import { ImageLabellingLayoutService } from 'src/layouts/image-labelling-layout/image-labelling-layout.service';
import { ImageLabellingModeService } from 'src/components/image-labelling/image-labelling-mode.service';
import { LanguageService } from 'src/shared/services/language.service';
import { ModalService } from 'src/components/modal/modal.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/components/spinner/spinner.service';
import { interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import {
    AddSubLabel,
    BboxMetadata,
    ChangeAnnotationLabel,
    CompleteMetadata,
    EventEmitter_Action,
    EventEmitter_ThumbnailDetails,
    EventEmitter_Url,
    ImageLabelUrl,
    ImgLabelProps,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
} from 'src/components/image-labelling/image-labelling.model';
import { Message } from 'src/shared/types/message/message.model';

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
    reloadTimer: any;
    @ViewChild('subLabelSelect') _subLabelSelect!: ElementRef<{ value: string }>;

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
    ) {
        const langsArr: string[] = ['image-labelling-en', 'image-labelling-cn', 'image-labelling-ms'];
        this._languageService.initializeLanguage(`image-labelling`, langsArr);
    }

    ngOnInit(): void {
        this.currentUrl = this._router.url as ImageLabelUrl;
        const { thumbnailList, labelList, projectName } = this._imgLblLayoutService.getRouteState(history);
        this.thumbnailList = thumbnailList;
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: thumbnailList.length };
        this.navigateByAction({ thumbnailAction: 1 });
        const newLabelList = this._imgLblLayoutService.displayLabelList<CompleteMetadata>(this.tabStatus, labelList);
        this.tabStatus = newLabelList;

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
        this._imgLblActionService.action$.pipe(takeUntil(this.unsubscribe$)).subscribe(({ clear }) => {
            if (clear) {
                this.thumbnailList[0].bnd_box && (this.thumbnailList[this.currentImageDisplayIndex].bnd_box = []);
                this.thumbnailList[0].polygons && (this.thumbnailList[this.currentImageDisplayIndex].polygons = []);

                this.onChangeSchema = {
                    ...this.onChangeSchema,
                    hasAnnotation: false,
                };
            }
        });

        this._spinnerService
            .returnAsObservable()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((loading) => (this.isLoading = this.showLoading && loading));
    }

    updateProjectProgress = (): void => {
        const projectName = this.selectedProjectName;
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
        // console.log(name, closed);
        const isExactTabState: boolean = this.tabStatus.some(
            (tab) => tab.name.toLowerCase() === name.toLowerCase() && tab.closed === closed,
        );
        isExactTabState
            ? null
            : (this.tabStatus = this.tabStatus.map((tab) =>
                  tab.name.toLowerCase() === name.toLowerCase() ? { ...tab, closed } : { ...tab },
              ));
    };

    onExport = (): void => {
        const projectName = this.selectedProjectName;
        const exportProject$ = this._imgLblApiService.exportProject(projectName);
        exportProject$.pipe(first()).subscribe(({ message }) => {
            if (message === 1) {
                this._languageService._translate.get('exportSuccess').subscribe((translated: any) => {
                    alert(projectName + translated);
                });
            } else {
                this._languageService._translate.get('exportFailed').subscribe((translated: any) => {
                    alert(translated + projectName);
                });
            }
        });
    };

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
                      first(({ message }) => {
                          const isValidResponse: boolean = message === 4 || message === 1;
                          return isValidResponse;
                      }),
                      mergeMap(({ uuid_add_list, uuid_delete_list, message }) => {
                          /** @property {number} message if value 4 means client has received uploaded item(s) */
                          this.isLoading = true;
                          let listTemp: string[] = [];
                          this.thumbnailList.forEach((element) => {
                              listTemp.push(element.uuid);
                          });
                          uuid_add_list.forEach((uuid) => {
                              listTemp.push(uuid);
                          });
                          uuid_delete_list.forEach((uuid) => {
                              listTemp = listTemp.filter((e) => e !== uuid);
                          });
                          // console.log(listTemp);
                          const thumbnails =
                              message === 4 && listTemp.length > 0
                                  ? listTemp.map((uuid) => thumbnail$(projectName, uuid))
                                  : [];

                          // console.log(thumbnails);
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
                (error: Error) => {},
                () => {
                    this.thumbnailList = thumbnailListTemp;
                    this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
                    this.isLoading = false;
                },
            );

        // make initial call
        this.subject$.next();
    };

    navigateByUrl = ({ url }: EventEmitter_Url): void => {
        // console.log(url);
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key }: KeyboardEvent): void => {
        this._imgLblActionService.action$.pipe(first()).subscribe(({ draw }) => {
            if (!draw) {
                switch (key) {
                    case 'ArrowLeft':
                        this.navigateByAction({ thumbnailAction: -1 });
                        break;
                    case 'ArrowRight':
                        this.navigateByAction({ thumbnailAction: 1 });
                        break;
                    case 'Escape':
                        this.onCloseModal();
                        break;
                    default:
                        break;
                }
            }
        });
    };

    navigateByAction = ({ thumbnailAction }: EventEmitter_Action): void => {
        if (thumbnailAction) {
            this.showLoading = true;
            const calculatedIndex = this._imgLblLayoutService.calculateIndex(
                thumbnailAction,
                this.currentImageDisplayIndex,
                this.thumbnailList.length,
            );

            if (calculatedIndex !== this.currentImageDisplayIndex) {
                this.currentImageDisplayIndex = calculatedIndex;
                const filteredThumbMetadata = this.thumbnailList.find((_, i) => i === calculatedIndex);
                const thumbnailIndex = this.thumbnailList.findIndex((_, i) => i === calculatedIndex);
                filteredThumbMetadata &&
                    thumbnailIndex !== -1 &&
                    this.displayImage({ ...filteredThumbMetadata, thumbnailIndex });
            }
        }
    };

    displayImage = (
        { thumbnailIndex, ...thumbnail }: EventEmitter_ThumbnailDetails,
        projectName = this.selectedProjectName,
    ): void => {
        if (this.selectedMetaData?.uuid !== thumbnail.uuid) {
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
    };

    onProcessLabel = ({ selectedLabel, label_list, action }: SelectedLabelProps) => {
        // console.log(selectedLabel, label_list, action);
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
        type === 'main' ? (this.mainLabelRegionVal = value) : (this.subLabelRegionVal = value);
    };

    onSubmitLabel = () => {
        const { value } = this._subLabelSelect.nativeElement;

        let isPreExistSubLabel: boolean = false;
        let isDupSubLabel: boolean = false;

        this.tabStatus.forEach(({ annotation }) =>
            annotation?.forEach(({ bnd_box, polygons }) => {
                const dynamicProp = bnd_box ?? polygons;
                if (dynamicProp) {
                    const { subLabel } = dynamicProp[this.currentAnnotationIndex];
                    isPreExistSubLabel = subLabel && subLabel?.length > 0 ? true : false;
                    isPreExistSubLabel ? subLabel?.some(({ label }) => (isDupSubLabel = label === value)) : null;
                } else {
                    console.log('missing prop bnd_box OR polygons');
                }
            }),
        );
        // console.log(isDupSubLabel);

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

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this._imgLblModeService.setState(null);
        this._imgLblActionService.setState(null);
        this.resetProjectStatus();
    }
}
