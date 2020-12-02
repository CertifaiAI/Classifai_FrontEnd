import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout.service';
import { first, takeUntil } from 'rxjs/operators';
import { HTMLElementEvent } from 'src/shared/type-casting/field/field.model';
import { ImageLabellingService } from './image-labelling-layout.service';
import { ModalService } from 'src/shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
    ImgLabelProps,
    ThumbnailMetadata,
    TabsProps,
    EventEmitter_Url,
    EventEmitter_Action,
    SelectedLabelProps,
    ThumbnailMetadataProps,
    ChangeAnnotationLabel,
    AddedSubLabel,
} from './image-labelling-layout.model';
import { AnnotateSelectionService } from 'src/shared/services/annotate-selection.service';

@Component({
    selector: 'image-labelling-layout',
    templateUrl: './image-labelling-layout.component.html',
    styleUrls: ['./image-labelling-layout.component.scss'],
})
export class ImageLabellingLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: ImgLabelProps;
    inputProjectName: string = '';
    selectedProjectName: string = '';
    imgSrc: string = '';
    loading: boolean = false;
    thumbnailList: ThumbnailMetadata[] = [];
    selectedMetaData!: ThumbnailMetadata;
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
    addedSubLabelList?: AddedSubLabel[];
    subLabelValidateMsg: string = '';
    currentAnnotationLabel: string = '';
    currentAnnotationIndex: number = -1;

    @ViewChild('subLabelSelect') _subLabelSelect!: ElementRef<{ value: string }>;

    constructor(
        private _router: Router,
        private _imgLabelService: ImageLabellingService,
        // private _spinnerService: SpinnerService,
        private _modalService: ModalService,
        private _dataSetService: DataSetLayoutService,
        private _annotateService: AnnotateSelectionService,
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
        }: { thumbnailList: ThumbnailMetadata[]; labelList: string[]; projectName: string } = window.history.state;

        this.thumbnailList = thumbnailList;
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: thumbnailList.length };
        // console.log(window.history.state);
        this.displayLabelList(labelList);

        this._annotateService.labelStaging$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(({ annotation: annnotationIndex, isDlbClick }) => {
                if (isDlbClick) {
                    this.onDisplayModal();
                    this.currentAnnotationIndex = annnotationIndex;
                    this.tabStatus.forEach(({ annotation }) =>
                        annotation?.forEach(({ bnd_box }) => {
                            const { label, region } = bnd_box[annnotationIndex];
                            this.currentAnnotationLabel = label;
                            this.mainLabelRegionVal = region || '';
                        }),
                    );
                } else {
                    this.currentAnnotationLabel = '';
                    this.currentAnnotationIndex = -1;
                }
            });
    }

    updateProjectProgress = (): void => {
        this.tabStatus.forEach(({ annotation }) => {
            annotation
                ? (this._imgLabelService.setLocalStorageProjectProgress(
                      this.inputProjectName || this.selectedProjectName,
                      annotation,
                  ),
                  annotation?.forEach((metadata) => {
                      this._imgLabelService
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
                              //         this._imgLabelService.getLocalStorageProjectProgress(
                              //             this.inputProjectName || this.selectedProjectName,
                              //         ),
                              //     );
                              // },
                          );
                  }))
                : null;
        });
    };

    onChangeMetadata = (mutatedMetadata: ThumbnailMetadata): void => {
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

    navigateByAction = <T extends EventEmitter_Action>({ thumbnailAction }: T): void => {
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
        const updateLabel$ = this._imgLabelService.updateLabelList(
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
        this.updateSelectedMetaData();
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
        this.updateSelectedMetaData();
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
            const getImage$ = this._imgLabelService.getBase64Thumbnail(projectName, uuid);
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
        selectedThumbnail: ThumbnailMetadata | Partial<ThumbnailMetadata>,
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
                const { subLabel } = bnd_box[this.currentAnnotationIndex];
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
                                      return i === this.currentAnnotationIndex
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
            this.updateProjectProgress();
        } else {
            this.subLabelValidateMsg = `Invalid of duplicate label: ${value}`;
        }
        this.updateSelectedMetaData();
        this.subLabelRegionVal = '';
    };

    onRemoveLabel = (selectedBBIndex: number, selectedSubLabelIndex: number) => {
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
        this.updateSelectedMetaData();
        this.updateProjectProgress();
    };

    /** @function responsible for updating selectedMetaData state to re-render object-detection comp */
    updateSelectedMetaData = () => {
        this.tabStatus.forEach(({ annotation }) => (annotation ? (this.selectedMetaData = annotation[0]) : null));
    };

    /** @event fires whenever browser is closing */
    @HostListener('window:beforeunload', ['$event'])
    resetProjectStatus = () => {
        this._dataSetService
            .manualCloseProject(this.inputProjectName || this.selectedProjectName)
            .pipe(first())
            .subscribe(({ message }) => {});
    };

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.resetProjectStatus();
    }
}
