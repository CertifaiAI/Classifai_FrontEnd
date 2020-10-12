import { Component, HostListener, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageLabellingService } from './image-labelling-layout.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import {
    IThumbnailMetadata,
    Props,
    TabsProps,
    EventEmitter_Action,
    EventEmitter_Url,
    ThumbnailMetadataProps,
    SelectedLabelProps,
} from './image-labelling-layout.model';

@Component({
    selector: 'image-labelling-layout',
    templateUrl: './image-labelling-layout.component.html',
    styleUrls: ['./image-labelling-layout.component.scss'],
})
export class ImageLabellingLayoutComponent implements OnInit {
    onChangeSchema!: Props;
    projects: string[] = [];
    inputProjectName: string = '';
    labelTextUpload!: FileList;
    labelArr: any[] = [];
    form!: FormGroup;
    subject$: Subject<any> = new Subject();
    subjectSubscription!: Subscription;
    selectedProjectName: string = '';
    imgSrc: string = '';
    thumbnailList: IThumbnailMetadata[] = [];
    selectedMetaData!: Partial<IThumbnailMetadata>;
    tabStatus: TabsProps[] = [
        {
            name: 'Project',
            closed: false,
        },
        {
            name: 'Label',
            closed: false,
            // label_list: ['default', 'dsa'],
            label_list: [],
        },
        {
            name: 'Annotation',
            closed: false,
        },
    ];

    constructor(private _router: Router, private _fb: FormBuilder, private _imgLabelService: ImageLabellingService) {
        // this.setState();
        this.createFormControls();
    }

    // setState = (): Props => {
    //     return (this.onChangeSchema = {
    //         ...this.onChangeSchema,
    //     });
    // };

    ngOnInit(): void {
        const {
            thumbnailList = [],
            projectName,
        }: { thumbnailList: IThumbnailMetadata[]; projectName: string } = window.history.state;
        this.thumbnailList = [...thumbnailList];
        this.selectedProjectName = projectName;
        this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: thumbnailList.length };
        // console.log(window.history.state);
    }

    createFormControls = (): void => {
        this.form = this._fb.group({
            projectName: [''],
            selectExistProject: [''],
            label: [''],
        });
        // this.form = this._formService.createControl(this.formJsonSchema);
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
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
        // console.log(isExactTabState);
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
        const projectName: string = this.selectedProjectName || this.inputProjectName;
        const updateLabel$ = this._imgLabelService.updateLabelList(
            projectName,
            newLabelList.length > 0 ? newLabelList : [],
        );

        updateLabel$.pipe(first()).subscribe(({ message }) => {
            message === 1
                ? (this.tabStatus = this.tabStatus.map((tab) => {
                      if (tab.label_list) {
                          // const newLabelList = tab.label_list.filter((label) => label !== selectedLabel);
                          return {
                              ...tab,
                              label_list: newLabelList,
                          };
                      }
                      return tab;
                  }))
                : console.error(`Error while updating label`);
        });
    };

    /** @function responsible for calling API to acquire thumbnail in original size
     *  @type optional ThumbnailMetadataProps
     *        which allows navigateByAction function to send only needed props due to optional type
     */
    showBase64Image = <T extends ThumbnailMetadataProps | Partial<ThumbnailMetadataProps>>(
        thumbnail: T,
        projectName: string = this.selectedProjectName || this.inputProjectName,
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
                () => {},
            );
        }
    };

    /** @function responsible for checking whether current selected thumbnail wanted to display is same as currently displaying image */
    isExactCurrentImage = (
        selectedThumbnail: IThumbnailMetadata | Partial<IThumbnailMetadata>,
        currentThumbnail: Partial<ThumbnailMetadataProps> = this.selectedMetaData,
    ): boolean => {
        return currentThumbnail?.uuid === selectedThumbnail?.uuid ? false : true;
    };

    /** @function curry function responsible for reusability of the function logic across layout comp. with minimal codebase
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

    /**
     * @param {KeyboardEvent} event keyboard keydown
     */
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        /**toggle in between move image and draw boxes */
        if (event.ctrlKey && event.shiftKey) {
            // console.log('success');
            this.onChangeSchema = {
                ...this.onChangeSchema,
                status: true,
            };
        }
        /**toggle move image by pixel */
        if (event.ctrlKey && event.altKey) {
            console.log('toggle image by px');
        }
        /**undo */
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            /**todo */
            console.log('undo test');
        }
        /**delete */
        if (event.key === 'Delete') {
            console.log('delete');
        }
        /**right arrow key */
        if (event.key === 'ArrowRight') {
            console.log('right arrow key');
        }
        /**left arrow key */
        if (event.key === 'ArrowLeft') {
            console.log('left arrow key');
        }
    }
}
