import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { first, takeUntil } from 'rxjs/operators';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingActionService } from 'src/components/image-labelling/image-labelling-action.service';
import { ImageLabellingApiService } from 'src/components/image-labelling/image-labelling-api.service';
import { ModalService } from 'src/components/modal/modal.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { uuid } from 'src/shared/types/message/message.model';
import {
    AddSubLabel,
    BboxMetadata,
    ChangeAnnotationLabel,
    EventEmitter_Action,
    EventEmitter_ThumbnailDetails,
    EventEmitter_Url,
    ImgLabelProps,
    PolyMetadata,
    SelectedLabelProps,
    TabsProps,
} from 'src/components/image-labelling/image-labelling.model';

@Component({
    selector: 'bounding-box-layout',
    templateUrl: './bounding-box-layout.component.html',
    styleUrls: ['./bounding-box-layout.component.scss'],
})
export class BoundingBoxLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: ImgLabelProps;
    inputProjectName: string = '';
    selectedProjectName: string = '';
    imgSrc: string = '';
    loading: boolean = false;
    thumbnailList: BboxMetadata[] = [];
    selectedMetaData!: BboxMetadata | PolyMetadata;
    unsubscribe$: Subject<any> = new Subject();
    tabStatus: TabsProps<BboxMetadata>[] = [
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
    mainLabelRegionVal = '';
    subLabelRegionVal = '';
    addedSubLabelList?: AddSubLabel[];
    subLabelValidateMsg = '';
    currentAnnotationLabel = '';
    currentBBoxAnnotationIndex = -1;
    currentImageDisplayIndex = -1;
    @ViewChild('subLabelSelect') _subLabelSelect!: ElementRef<{ value: string }>;

    constructor(
        private _router: Router,
        private _imgLblApiService: ImageLabellingApiService,
        private _modalService: ModalService,
        private _dataSetService: DataSetLayoutService,
        private _annotateService: AnnotateSelectionService,
        private _imgLblStateService: ImageLabellingActionService,
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
        }: { thumbnailList: BboxMetadata[]; labelList: string[]; projectName: string } = window.history.state;

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
                        annotation?.forEach(({ bnd_box }) => {
                            const { label, region } = bnd_box[annnotationIndex];
                            this.currentAnnotationLabel = label;
                            this.mainLabelRegionVal = region || '';
                        }),
                    );
                    this._imgLblStateService.setState({ isActiveModal: true, draw: false, drag: false, scroll: false });
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
                ? (this._imgLblApiService.setLocalStorageProjectProgress(
                      this.inputProjectName || this.selectedProjectName,
                      annotation,
                  ),
                  annotation?.forEach((metadata) => {
                      this._imgLblApiService
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
                              //         this._imgLblApiService.getLocalStorageProjectProgress(
                              //             this.inputProjectName || this.selectedProjectName,
                              //         ),
                              //     );
                              // },
                          );
                  }))
                : null;
        });
    };

    onChangeMetadata = (mutatedMetadata: BboxMetadata & PolyMetadata): void => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation ? { ...tab, annotation: [mutatedMetadata] } : tab,
        );
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

    navigateByUrl = ({ url }: EventEmitter_Url): void => {
        // console.log(url);
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    navigateByAction = ({ thumbnailAction }: EventEmitter_Action): void => {
        if (thumbnailAction) {
            const calculatedIndex = this.calculateIndex(
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

    calculateIndex = (
        thumbnailAction: Required<Omit<EventEmitter_Action, 'thumbnailAction'>>,
        currImageIndex: number,
        thumbnailListLength: number,
    ) => {
        let calIndex = currImageIndex;
        const finalIndex =
            thumbnailAction === 1
                ? calIndex >= thumbnailListLength - 1
                    ? thumbnailListLength - 1
                    : (calIndex += 1)
                : calIndex <= 0
                ? 0
                : (currImageIndex -= 1);

        return finalIndex;
    };

    displayImage = (
        { thumbnailIndex, ...thumbnail }: EventEmitter_ThumbnailDetails,
        projectName = this.selectedProjectName,
    ): void => {
        const getImage$ = this._imgLblApiService.getBase64Thumbnail(projectName, thumbnail.uuid);

        getImage$.pipe(first()).subscribe(
            ({ message, img_src }) => {
                message === 1 &&
                    ((this.selectedMetaData = thumbnail),
                    (this.imgSrc = img_src),
                    (this.onChangeSchema = {
                        ...this.onChangeSchema,
                        // + 1 to prevent showing photo but info comp shows 0/2 on UI
                        currentThumbnailIndex: thumbnailIndex + 1,
                        thumbnailName: thumbnail.img_path,
                    }));
            },
            (err: Error) => console.error(err),
        );
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

    onChangeAnnotationLabel = ({ label, index }: ChangeAnnotationLabel): void => {
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map((metadata) => {
                          return {
                              ...metadata,
                              bnd_box: metadata.bnd_box.map((box, i) =>
                                  i === index
                                      ? {
                                            ...box,
                                            label,
                                        }
                                      : box,
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
                              bnd_box: metadata.bnd_box.filter((_, i) => i !== index),
                          };
                      }),
                  }
                : tab,
        );
        this.updateStateToRenderChild();
        this.updateProjectProgress();
    };

    /**
     * @function responsible for reusability of the function logic across layout comp. with minimal codebase
     *            also responsible to check whether uuid exist in state and whether same uuid as current selected thumbnail state
     *            this behavior helps to prevent unnecessary API calls, thus maintain the health of performances for front & backend
     */
    validateUuid = (uuid: uuid) => {
        return (currentUuid?: uuid): boolean => {
            return (this.thumbnailList.find((thumbnail) => thumbnail.uuid === uuid) || false) && currentUuid !== uuid;
        };
    };

    onDisplayModal = (id = 'modal-image-labelling') => {
        this.subLabelRegionVal = '';
        this.subLabelValidateMsg = '';
        this._modalService.open(id);
    };

    onCloseModal = (id = 'modal-image-labelling') => {
        this._imgLblStateService.setState({ isActiveModal: false, draw: true, scroll: true });
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
            annotation?.forEach(({ bnd_box }) => {
                const { subLabel } = bnd_box[this.currentBBoxAnnotationIndex];
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
                                  bnd_box: metadata.bnd_box.map((bb, i) => {
                                      return i === this.currentBBoxAnnotationIndex
                                          ? {
                                                ...bb,
                                                region: this.mainLabelRegionVal,
                                                subLabel:
                                                    bb.subLabel && bb.subLabel.length > 0
                                                        ? [
                                                              ...bb.subLabel,
                                                              { label: value, region: this.subLabelRegionVal },
                                                          ]
                                                        : [{ label: value, region: this.subLabelRegionVal }],
                                            }
                                          : bb;
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
                              bnd_box: metadata.bnd_box.map((bb, bbIndex) => {
                                  return bbIndex === selectedBBIndex
                                      ? {
                                            ...bb,
                                            subLabel: bb.subLabel?.filter((_, i) => i !== selectedSubLabelIndex),
                                        }
                                      : bb;
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
