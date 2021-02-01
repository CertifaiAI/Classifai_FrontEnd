import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout.service';
import { first, takeUntil } from 'rxjs/operators';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ModalService } from 'src/components/modal/modal.service';
import { Router } from '@angular/router';
import { SegmentationService } from './segmentation-layout.service';
import { SegmentationStateService } from './segmentation-state.service';
import { Subject } from 'rxjs';
import {
    AddedBBoxSubLabel,
    ChangeAnnotationLabel,
    EventEmitter_BBoxAction,
    EventEmitter_Url,
    ImgLabelProps,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
    ThumbnailMetadataProps,
} from '../segmentation-layout/segmentation-layout.model';

@Component({
    selector: 'segmentation-layout',
    templateUrl: './segmentation-layout.component.html',
    styleUrls: ['./segmentation-layout.component.scss'],
})
export class SegmentationLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: ImgLabelProps;
    inputProjectName: string = '';
    selectedProjectName: string = '';
    imgSrc: string = '';
    loading: boolean = false;
    thumbnailList: PolyMetadata[] = [];
    selectedMetaData!: PolyMetadata;
    unsubscribe$: Subject<any> = new Subject();
    tabStatus: TabsProps[] = [
        {
            name: 'Project',
            closed: false,
        },
        {
            name: 'Label',
            closed: false,
            label_list: [],
        },
        {
            name: 'Annotation',
            closed: false,
            annotation: [],
        },
    ];
    mainLabelRegionVal: string = '';
    subLabelRegionVal: string = '';
    addedSubLabelList?: AddedBBoxSubLabel[];
    subLabelValidateMsg: string = '';
    currentAnnotationLabel: string = '';
    currentBBoxAnnotationIndex: number = -1;

    @ViewChild('subLabelSelect') _subLabelSelect!: ElementRef<{ value: string }>;

    constructor(
        public _router: Router,
        private _segmentationService: SegmentationService,
        // private _spinnerService: SpinnerService,
        private _modalService: ModalService,
        private _dataSetService: DataSetLayoutService,
        private _annotateService: AnnotateSelectionService,
        private _segStateService: SegmentationStateService,
    ) {}

    ngOnInit(): void {
        // this._spinnerService
        //     .returnAsObservable()
        //     .pipe(takeUntil(this.unsubscribe$))
        //     .subscribe((loading) => (this.loading = loading));

        const {
            thumbnailList = [],
            labelList = [],
            projectName,
        }: { thumbnailList: PolyMetadata[]; labelList: string[]; projectName: string } = window.history.state;

        this.thumbnailList = thumbnailList;
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: thumbnailList.length };
        // console.log(window.history.state);
        this.displayLabelList(labelList);

        this._annotateService.labelStaging$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                if (isDlbClick) {
                    this.currentBBoxAnnotationIndex = annnotationIndex;
                    this.tabStatus.forEach(({ annotation }) =>
                        annotation?.forEach(({ polygons }) => {
                            const { label, region } = polygons[annnotationIndex];
                            this.currentAnnotationLabel = label;
                            this.mainLabelRegionVal = region || '';
                        }),
                    );
                    this._segStateService.setState({ isActiveModal: true, draw: false, drag: false, scroll: false });
                    this.onDisplayModal();
                } else {
                    this.currentAnnotationLabel = '';
                    this.currentBBoxAnnotationIndex = -1;
                }
            });
    }

    updateProjectProgress = (): void => {
        this.tabStatus.forEach(({ annotation }) => {
            annotation
                ? (this._segmentationService.setLocalStorageProjectProgress(
                      this.inputProjectName || this.selectedProjectName,
                      annotation,
                  ),
                  annotation?.forEach((metadata) => {
                      this._segmentationService
                          .updateProjectProgress(
                              this.inputProjectName || this.selectedProjectName,
                              metadata.uuid,
                              metadata,
                          )
                          .pipe(first())
                          .subscribe(
                              ({ error_code, message }) => {},
                              // (err: Error) => {},
                              // () => {
                              //     console.log(
                              //         this._segmentationService.getLocalStorageProjectProgress(
                              //             this.inputProjectName || this.selectedProjectName,
                              //         ),
                              //     );
                              // },
                          );
                  }))
                : null;
        });
    };

    onChangeMetadata = (mutatedMetadata: PolyMetadata): void => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation ? { ...tab, annotation: [mutatedMetadata] } : tab,
        );
        this.updateProjectProgress();
    };

    onToggleTab = <T extends TabsProps>({ name, closed }: T): void => {
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

    navigateByUrl = <T extends EventEmitter_Url>({ url }: T): void => {
        // console.log(url);
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    navigateByAction = <T extends EventEmitter_BBoxAction>({ thumbnailAction }: T): void => {
        if (thumbnailAction) {
            let { uuid } = this.selectedMetaData || false;
            if (uuid) {
                this.showBase64Image({ uuid: thumbnailAction === 1 ? (uuid += 1) : (uuid -= 1) });
            } else {
                const firstThumbnail = this.thumbnailList.find((thumb) => thumb.uuid);
                firstThumbnail
                    ? this.showBase64Image({ uuid: firstThumbnail.uuid })
                    : this.showBase64Image({ uuid: 1 });
            }
        }
    };

    onProcessLabel = <T extends SelectedLabelProps>({ selectedLabel, label_list, action }: T) => {
        // console.log(selectedLabel, label_list, action);
        const newLabelList: string[] =
            selectedLabel && !action ? label_list.filter((label) => label !== selectedLabel) : label_list;
        const projectName: string = this.selectedProjectName;
        const updateLabel$ = this._segmentationService.updateLabelList(
            projectName,
            newLabelList.length > 0 ? newLabelList : [],
        );

        updateLabel$.pipe(first()).subscribe(({ message }) => {
            message === 1 ? this.displayLabelList(newLabelList) : console.error(`Error while updating label`);
        });

        this.updateProjectProgress();
    };

    displayLabelList = (newLabelList: string[]): void => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.label_list
                ? {
                      ...tab,
                      label_list: newLabelList,
                  }
                : tab,
        );
    };

    onChangeAnnotationLabel = <T extends ChangeAnnotationLabel>({ label, index }: T): void => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map((metadata) => {
                          return {
                              ...metadata,
                              polygons: metadata.polygons.map((poly, i) =>
                                  i === index
                                      ? {
                                            ...poly,
                                            label,
                                        }
                                      : poly,
                              ),
                          };
                      }),
                  }
                : tab,
        );
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    onDeleteAnnotation = (index: number) => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map((metadata) => {
                          return {
                              ...metadata,
                              polygons: metadata.polygons.filter((_, i) => i !== index),
                          };
                      }),
                  }
                : tab,
        );
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    /**
     *  @function responsible for calling API to acquire thumbnail in original size
     *  @type optional ThumbnailMetadataProps
     *        which allows navigateByAction function to send only needed props due to optional type
     */
    showBase64Image = <T extends ThumbnailMetadataProps | Partial<ThumbnailMetadataProps>>(
        thumbnail: T,
        projectName: string = this.selectedProjectName,
    ): void => {
        const { uuid } = thumbnail;
        if (uuid && this.validateUuid(uuid)(this.selectedMetaData?.uuid) && this.isExactCurrentImage(thumbnail)) {
            const getImage$ = this._segmentationService.getBase64Thumbnail(projectName, uuid);
            const filteredThumbInfo = this.thumbnailList.find((f) => f.uuid === uuid);
            const thumbIndex = this.thumbnailList.findIndex((f) => f.uuid === uuid);
            getImage$.pipe(first()).subscribe(
                ({ message, img_src, errormessage }) => {
                    message === 1 && filteredThumbInfo
                        ? // (this.selectedThumbnail = { ...thumbnail, ...filteredThumbInfo, img_src }),
                          ((this.selectedMetaData = filteredThumbInfo),
                          (this.imgSrc = img_src),
                          (this.onChangeSchema = {
                              ...this.onChangeSchema,
                              currentThumbnailIndex: thumbIndex + 1,
                              thumbnailName: filteredThumbInfo?.img_path,
                          }))
                        : console.error(errormessage);
                },
                (err: Error) => console.error(err),
            );
        }
    };

    /** @function responsible for checking whether current selected thumbnail wanted to display is same as currently displaying image */
    isExactCurrentImage = (
        selectedThumbnail: PolyMetadata | Partial<PolyMetadata>,
        currentThumbnail: Partial<ThumbnailMetadataProps> = this.selectedMetaData,
    ): boolean => {
        return currentThumbnail?.uuid === selectedThumbnail?.uuid ? false : true;
    };

    /**
     * @function responsible for reusability of the function logic across layout comp. with minimal codebase
     *            also responsible to check whether uuid exist in state and whether same uuid as current selected thumbnail state
     *            this behavior helps to prevent unnecessary API calls, thus maintain the health of performances for front & backend
     */
    validateUuid = (uuid: number) => {
        return (currentThumbnailUuid?: number): boolean => {
            return (
                (this.thumbnailList.find((thumbnail) => thumbnail.uuid === uuid) || false) &&
                currentThumbnailUuid !== uuid
            );
        };
    };

    onDisplayModal = (id: string = 'custom-modal-1') => {
        // this.mainLabelRegionVal = '';
        this.subLabelRegionVal = '';
        this.subLabelValidateMsg = '';
        this._modalService.open(id);
    };

    onCloseModal = (id: string = 'custom-modal-1') => {
        this._segStateService.setState({ isActiveModal: false, draw: true, scroll: true });
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
            annotation?.forEach(({ polygons }) => {
                const { subLabel } = polygons[this.currentBBoxAnnotationIndex];
                isPreExistSubLabel = subLabel && subLabel?.length > 0 ? true : false;
                isPreExistSubLabel ? subLabel?.some(({ label }) => (isDupSubLabel = label === value)) : null;
            }),
        );
        // console.log(isDupSubLabel);

        if (!isDupSubLabel) {
            this.tabStatus = this.tabStatus.map((tab) =>
                tab.annotation
                    ? {
                          ...tab,
                          annotation: tab.annotation.map((metadata) => {
                              return {
                                  ...metadata,
                                  polygons: metadata.polygons.map((poly, i) => {
                                      return i === this.currentBBoxAnnotationIndex
                                          ? {
                                                ...poly,
                                                region: this.mainLabelRegionVal,
                                                subLabel:
                                                    poly.subLabel && poly.subLabel.length > 0
                                                        ? [
                                                              ...poly.subLabel,
                                                              { label: value, region: this.subLabelRegionVal },
                                                          ]
                                                        : [{ label: value, region: this.subLabelRegionVal }],
                                            }
                                          : poly;
                                  }),
                              };
                          }),
                      }
                    : tab,
            );
            this.subLabelValidateMsg = '';
            this.updateStateToRenderChild();
            this.updateProjectProgress();
        } else {
            this.subLabelValidateMsg = `Invalid of duplicate label: ${value}`;
        }
        this.subLabelRegionVal = '';
    };

    onRemoveSubLabel = (selectedBBIndex: number, selectedSubLabelIndex: number) => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map((metadata) => {
                          return {
                              ...metadata,
                              polygons: metadata.polygons.map((poly, bbIndex) => {
                                  return bbIndex === selectedBBIndex
                                      ? {
                                            ...poly,
                                            subLabel: poly.subLabel?.filter((_, i) => i !== selectedSubLabelIndex),
                                        }
                                      : poly;
                              }),
                          };
                      }),
                  }
                : tab,
        );
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
    resetProjectStatus = (projectName: string) => {
        projectName
            ? this._dataSetService
                  .manualCloseProject(projectName)
                  .pipe(first())
                  .subscribe(({ message }) => {})
            : null;
    };

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.resetProjectStatus(this.inputProjectName || this.selectedProjectName);
    }
}
