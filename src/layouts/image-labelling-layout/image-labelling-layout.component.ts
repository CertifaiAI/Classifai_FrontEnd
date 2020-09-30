import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ClassifaiModalService } from 'src/shared/classifai-modal/classifai-modal.service';
import { first, flatMap, map, mergeMap } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageLabellingService } from './image-labelling-layout.service';
import { Router } from '@angular/router';
import { ThemeService } from 'src/shared/services/theme.service';
import {
    ILabelList,
    IThumbnailMetadata,
    Props,
    IMessage,
    TabsProps,
    SelectedLabelProps,
    EventEmitter_Action,
    EventEmitter_Url,
    ThumbnailMetadataProps,
} from './image-labelling-layout.model';

@Component({
    selector: 'image-labelling-layout',
    templateUrl: './image-labelling-layout.component.html',
    styleUrls: ['./image-labelling-layout.component.css'],
})
export class ImageLabellingLayoutComponent implements OnInit {
    /** @prop default as 'dark-theme', prevent undefined prop pass to child comps.*/
    // theme: string;
    // status: boolean;
    mediaTheme: MediaQueryList = window.matchMedia('(prefers-color-scheme: light)');
    onChangeSchema!: Props;
    projects: string[] = [];
    inputProjectName: string = '';
    labelTextUpload!: FileList;
    labelArr: any[] = [];
    form!: FormGroup;
    subject$: Subject<any> = new Subject();
    subjectSubscription!: Subscription;
    // timerSubscription: Subscription;
    // labelList: ILabelList;
    selectedProjectName: string = '';
    thumbnailList: IThumbnailMetadata[] = [];
    // selectedThumbnail: SelectedThumbnailProps = {
    //     img_src: '',
    //     uuid: 0,
    // };
    selectedThumbnail!: Partial<IThumbnailMetadata>;
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

    constructor(
        private _router: Router,
        private _fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _themeService: ThemeService,
        private _modalService: ClassifaiModalService,
        private _imgLabelService: ImageLabellingService,
    ) {
        this.setState();
        this.createFormControls();
        this._imgLabelService
            .getProjectList()
            .pipe(first())
            .subscribe(({ message, content, errormessage }) => (this.projects = content)),
            (error: Error) => {
                console.error(error);
            },
            () => this._modalService.open();
    }

    setState = (): Props => {
        return (this.onChangeSchema = {
            ...this.onChangeSchema,
            theme: this._themeService.getThemeState(),
        });
    };

    ngOnInit(): void {
        this.mediaTheme.addEventListener('change', this.detectBrowserTheme, false);
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

    onFileChange = (event: any): void => {
        const { files }: { files: any[] } = event.target;
        const reader = new FileReader();

        if (files && files.length) {
            const [file] = files;

            reader.onload = () => {
                this.form.patchValue({
                    label: reader.result,
                });
                // need to run CD since file load runs outside of zone
                this._cd.markForCheck();
            };
            reader.onloadend = () => {
                const labelResult = reader.result as string;
                const labelSplitArr = labelResult.split('\n');
                if (labelSplitArr.length > 0) {
                    const newLabelArray = labelSplitArr.reduce((prev: string[], curr: string) => {
                        const clearCharLabel = curr.replace(/[^A-Z0-9]+/gi, '').toLowerCase();
                        prev.push(clearCharLabel);
                        return prev;
                    }, []);
                    this.labelArr.push(...newLabelArray);
                    // console.log(this.labelArr);
                }
            };
            // console.log(file);
            reader.readAsText(file);
        }
    };

    onSubmit = (isNewProject: boolean): void => {
        this.form.markAllAsTouched();

        if (!isNewProject) {
            if (this.form.get('selectExistProject')?.value) {
                this.startProject(this.form.get('selectExistProject')?.value);
                this.selectedProjectName = this.form.get('selectExistProject')?.value;
            } else {
                this.form.get('selectExistProject')?.setErrors({ required: true });
            }
        }
        if (isNewProject) {
            if (this.inputProjectName) {
                const checkExistProject = this.projects
                    ? this.projects.find((project) => (project ? project === this.inputProjectName : null))
                    : null;
                checkExistProject
                    ? this.form.get('projectName')?.setErrors({ exist: true })
                    : (this.createProject(this.inputProjectName),
                      (this.selectedProjectName = this.form.get('projectName')?.value));
                // null;
            } else {
                this.form.get('projectName')?.setErrors({ required: true });
            }
        }
    };

    startProject = (projectName: string): void => {
        const streamProj$ = this._imgLabelService.checkExistProject(projectName);
        const streamProjStatus$ = this._imgLabelService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._imgLabelService.getThumbnailList;

        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                flatMap(() => forkJoin([streamProj$, streamProjStatus$])),
                mergeMap(([resExist, { message, uuid_list, label_list }]) => {
                    if (message === 2) {
                        this.tabStatus = this.tabStatus.map((tab) =>
                            tab.label_list ? (tab.label_list = label_list) && tab : tab,
                        );
                        return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
                    } else {
                        const ThumbnailResponse = interval(500).pipe(
                            flatMap(() => streamProjStatus$),
                            first(({ message }) => message === 2),
                            mergeMap(({ uuid_list }) =>
                                uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [],
                            ),
                        );
                        return ThumbnailResponse;
                    }
                }),
                // * this flatMap responsible for flaten all observable into one layer
                flatMap((data) => data),
            )
            .subscribe(
                (res) => {
                    this.thumbnailList = [...this.thumbnailList, res];
                    this.onChangeSchema = { ...this.onChangeSchema, totalNumThumbnail: this.thumbnailList.length };
                    // this.tabStatus = [...this.tabStatus, { name: 'Label', closed, label_list: [] }];
                },
                (error: Error) => console.error(error),
                () => {
                    const [{ label_list }] = this.tabStatus;
                    label_list && label_list.length < 1
                        ? this.onProcessLabel({ selectedLabel: '', label_list: [], action: 1 })
                        : null;
                    this._modalService.close();
                    // console.log(this.thumbnailList);
                },
            );

        // make initial call
        this.subject$.next();
    };

    onToggleTab = <T extends TabsProps>({ name, closed }: T): void => {
        console.log(name, closed);
        this.tabStatus = this.tabStatus.map((tab) =>
            tab.name.toLowerCase() === name.toLowerCase() ? { ...tab, closed } : { ...tab },
        );
    };

    uploadThumbnail = (projectName: string = this.selectedProjectName || this.inputProjectName): void => {
        const uploadType$ = this._imgLabelService.localUploadThumbnail(projectName);
        const uploadStatus$ = this._imgLabelService.localUploadStatus(projectName);
        const thumbnail$ = this._imgLabelService.getThumbnailList;

        const returnResponse = <T extends IMessage>({ message }: T): Observable<IThumbnailMetadata> => {
            return message === 1
                ? interval(500).pipe(
                      flatMap(() => uploadStatus$),
                      first(({ message }) => message === 4),
                      mergeMap(({ uuid_list }) =>
                          uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [],
                      ),
                      // * this flatMap responsible for flaten all observable into one layer
                      flatMap((data) => data),
                  )
                : message === 5
                ? throwError((err: any) => err)
                : throwError((err: any) => err);

            // if (message === 1) {
            //   const uploadTypeResponse = interval(500).pipe(
            //     flatMap(() => uploadStatus$),
            //     first(({ message }) => message === 4),
            //     mergeMap(({ uuid_list }) =>
            //       uuid_list.length > 0
            //         ? uuid_list.map((uuid) => thumbnail$(projectName, uuid))
            //         : []
            //     ),
            //     // * this flatMap responsible for flaten all observable into one layer
            //     flatMap((data) => data)
            //   );
            //   return uploadTypeResponse;
            // }
            // if (message === 5) {
            //   catchError((err) => {
            //     console.error(err);
            //     return of(err);
            //   });
            // }
        };

        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                flatMap(() => uploadType$),
                mergeMap((val) => returnResponse(val)),
            )
            .subscribe(
                (res) => (this.thumbnailList = [...this.thumbnailList, res]),
                (error: Error) => console.error(error),
                () => this._modalService.close(),
            );
        // make initial call
        this.subject$.next();

        // /** @constant uses Array.from due to props 'type' of FileList are type of Iterable  */
        // const arrFiles: File[] = Array.from(files);
        // console.log(arrFiles);
        // const filteredFiles = arrFiles.filter((file) => {
        //   const { type } = file;
        //   const validateFileType =
        //     type && (type === 'image/jpeg' || type === 'image/png') ? file : null;
        //   return validateFileType;
        // });
        // console.log(filteredFiles);
    };

    navigateByUrl = <T extends EventEmitter_Url>({ url }: T): void => {
        // console.log(url);
        url ? this._router.navigate([url]) : console.error(`No url received from child component`);
    };

    navigateByAction = <T extends EventEmitter_Action>({ thumbnailAction }: T): void => {
        if (thumbnailAction) {
            let { uuid } = this.selectedThumbnail || false;
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

    /** @function responsible for calling API to acquire thumbnail in original size
     *  @type optional ThumbnailMetadataProps
     *        which allows navigateByAction function to send only needed props due to optional type
     */
    showBase64Image = <T extends ThumbnailMetadataProps | Partial<ThumbnailMetadataProps>>(
        thumbnail: T,
        projectName: string = this.selectedProjectName || this.inputProjectName,
    ): void => {
        const { uuid } = thumbnail;
        if (uuid && this.validateUuid(uuid)(this.selectedThumbnail?.uuid)) {
            const getImage$ = this._imgLabelService.getBase64Thumbnail(projectName, uuid);
            const filteredThumbInfo = this.thumbnailList.find((f) => f.uuid === uuid);
            getImage$.pipe(first()).subscribe(
                ({ message, img_src, errormessage }) => {
                    message === 1 && thumbnail
                        ? (this.selectedThumbnail = { ...thumbnail, ...filteredThumbInfo, img_src })
                        : console.error(errormessage);
                },
                (err: Error) => console.error(err),
                () => {},
            );
        }
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

    setLabelListLocalStorage = (labelList: ILabelList): void => {
        console.log(labelList);
    };

    createProject = (projectName: string): void => {
        const createProj$ = this._imgLabelService.createNewProject(projectName);
        const updateLabel$ = this._imgLabelService.updateLabelList(projectName, this.labelArr);

        createProj$
            .pipe(
                first(),
                map(({ message }) => message),
                mergeMap((message) => updateLabel$),
            )
            .subscribe(({ message }) => {
                console.log(message === 1);
                message === 1 ? this._modalService.close() : null;
            });
    };

    //#region Archived createProject & updateProjectLabel function

    // createProject = (projectName: string): void => {
    //   this._imgLabelService
    //     .createNewProject(projectName)
    //     .pipe(first())
    //     .subscribe(
    //       ({ message }) => {
    //         message ? this.updateProjectLabel(projectName) : null;
    //       },
    //       (error: Error) => console.error(error)
    //       // () => this.updateProjectLabel(projectName)
    //     );
    // };

    // updateProjectLabel = (projectName: string): void => {
    //   this._imgLabelService
    //     .updateLabel(projectName, this.labelArr)
    //     .pipe(first())
    //     .subscribe(
    //       (res) => {
    //         console.log(res);
    //       },
    //       (error: Error) => {},
    //       () => {
    //         this.closeModal('custom-modal-1');
    //       }
    //     );
    // };

    //#endregion

    detectBrowserTheme = (e: any): void => {
        this.onChangeSchema = {
            ...this.onChangeSchema,
            theme: e.matches ? 'dark-theme' : 'light-theme',
        };
    };

    /**
     * @param {KeyboardEvent} event keyboard keydown
     */
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        /**toggle in between move image and draw boxes */
        if (event.ctrlKey && event.shiftKey) {
            console.log('success');
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

    /** @callback method used by Angular to clean up eventListener after comp. is destroyed */
    ngOnDestroy(): void {
        this.mediaTheme.removeEventListener('change', this.detectBrowserTheme, false);
        this._modalService.remove();
        this.subjectSubscription ? this.subjectSubscription.unsubscribe() : null;
        // this.timerSubscription ? this.timerSubscription.unsubscribe() : null;
    }
}
