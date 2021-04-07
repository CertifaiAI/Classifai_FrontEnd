import { BboxMetadata, ImageLabellingMode, PolyMetadata } from 'src/components/image-labelling/image-labelling.model';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { DataSetLayoutService } from './data-set-layout-api.service';
import { DataSetProps, ProjectSchema, StarredProps, UploadThumbnailProps } from './data-set-layout.model';
import { distinctUntilChanged, first, map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HTMLElementEvent } from 'src/shared/types/field/field.model';
import { ImageLabellingModeService } from './../../components/image-labelling/image-labelling-mode.service';
import { Message } from 'src/shared/types/message/message.model';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/components/spinner/spinner.service';
import { LanguageService } from 'src/shared/services/language.service';

@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit, OnDestroy {
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
    inputProjectName: string = '';
    selectedProjectName: string = '';
    labelTextUpload: any[] = [];
    form!: FormGroup;
    displayModal: boolean = false;
    subject$: Subject<any> = new Subject();
    subjectSubscription?: Subscription;
    thumbnailList: BboxMetadata[] & PolyMetadata[] = [];
    labelList: string[] = [];
    unsubscribe$: Subject<any> = new Subject();
    isLoading = false;
    isOverlayOn = false;
    isImageUploading = false;
    imgLblMode: ImageLabellingMode = null;
    @ViewChild('refProjectName') _refProjectName!: ElementRef<HTMLInputElement>;
    @ViewChild('labeltextfile') _labelTextFile!: ElementRef<HTMLInputElement>;
    @ViewChild('labeltextfilename') _labelTextFilename!: ElementRef<HTMLLabelElement>;

    constructor(
        private _fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _router: Router,
        private _dataSetService: DataSetLayoutService,
        private _spinnerService: SpinnerService,
        private _imgLblModeService: ImageLabellingModeService,
        private _languageService: LanguageService,
    ) {
        this._imgLblModeService.imgLabelMode$
            .pipe(distinctUntilChanged())
            .subscribe((modeVal) => (this.imgLblMode = modeVal));

        this._spinnerService
            .returnAsObservable()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((loading) => (this.isLoading = loading));

        this.createFormControls();
        const langsArr: string[] = ['data-set-page-en', 'data-set-page-cn', 'data-set-page-ms'];
        this._languageService.initializeLanguage(`data-set-page`, langsArr);
    }

    ngOnInit(): void {
        this.getProjectList();
    }

    getProjectList = (): void => {
        this.projectList.isFetching = true;
        this._dataSetService
            .getProjectList()
            .pipe(first())
            .subscribe(({ content }) => {
                if (content) {
                    const clonedProjectList = cloneDeep(content);
                    // const sortedProject = clonedProjectList.sort((a, b) => (b.created_date > a.created_date ? 1 : -1));
                    const formattedProjectList = clonedProjectList.map((project) => {
                        const newProjectList = (project = {
                            ...project,
                            created_date: this.formatDate(project.created_date),
                        });
                        return newProjectList;
                    });
                    // console.log(formattedProjectList);
                    this.projectList.projects = [...formattedProjectList];
                    this.projectList.isFetching = false;
                }
            }),
            (error: Error) => {
                console.error(error);
                this.projectList.isFetching = false;
            };
    };

    formatDate = (date: string): string => {
        const initializedDate: Date = new Date(date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const actualMonth: string | undefined = monthNames.find(
            (_, i) => i === initializedDate.getMonth() || undefined,
        );

        return actualMonth ? `${actualMonth}-${initializedDate.getDate()}-${initializedDate.getFullYear()}` : 'Error';
    };

    createFormControls = (): void => {
        this.form = this._fb.group({
            projectName: ['', Validators.required],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    toggleModalDisplay = (shown: boolean): void => {
        this._labelTextFilename.nativeElement.innerHTML = '';
        this.labelTextUpload = [];
        shown ? this.form.reset() : null;
        this.displayModal = shown;
        /** timeOut needed to allow focus due to Angular's templating sys issue / bug */
        setTimeout(() => this._refProjectName.nativeElement.focus());
    };

    importProject = (): void => {
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
                            this.isOverlayOn = response.message === 0 ? true : false;
                            if (response.message === 1 || response.message === 4) {
                                refreshProjectList = true;
                            }

                            return refreshProjectList;
                        }),
                    )
                    .subscribe((response) => {
                        this.getProjectList();
                    });
            });
    };

    onFileChange = ({ target: { files } }: HTMLElementEvent<HTMLInputElement>): void => {
        const filename = this._labelTextFile.nativeElement.files?.item(0)?.name!;
        this._labelTextFilename.nativeElement.innerHTML = filename === undefined ? '' : filename;
        const reader = new FileReader();

        if (files && files.length) {
            const file = files.item(0);
            reader.onload = () => {
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
                    // clear entire array before giving it new set of data, prevents stacking more array of data
                    this.labelTextUpload = [];
                    // spread due to newLabelArray is already an array
                    // with push would lead to nested array
                    this.labelTextUpload.push(...newLabelArray);
                    // console.log(this.labelTextUpload);
                }
            };
            // console.log(file);
            file && reader.readAsText(file);
        }
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
            projectName ? this.startProject(projectName) : null;
            // if (this.form.get('selectExistProject')?.value) {
            //     // this.startProject(this.form.get('selectExistProject')?.value);
            //     this.selectedProjectName = this.form.get('selectExistProject')?.value;
            // } else {
            //     this.form.get('selectExistProject')?.setErrors({ required: true });
            // }
        } else {
            if (this.inputProjectName) {
                const checkExistProject = this.projectList.projects
                    ? this.projectList.projects.find((project) =>
                          project ? project.project_name === this.inputProjectName : null,
                      )
                    : null;
                checkExistProject
                    ? (this.form.get('projectName')?.setErrors({ exist: true }),
                      this._refProjectName.nativeElement.focus())
                    : (this.createProject(this.inputProjectName),
                      (this.selectedProjectName = this.form.get('projectName')?.value),
                      (this.labelTextUpload = []),
                      (this._labelTextFilename.nativeElement.innerHTML = ''));
            } else {
                this.form.get('projectName')?.setErrors({ required: true });
                this._refProjectName.nativeElement.focus();
            }
        }
    };

    startProject = (projectName: string): void => {
        this.selectedProjectName = projectName;
        const projMetaStatus$ = this._dataSetService.checkProjectStatus(projectName);
        const updateProjLoadStatus$ = this._dataSetService.updateProjectLoadStatus(projectName);
        const projLoadingStatus$ = this._dataSetService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;

        this.subjectSubscription = this.subject$
            .pipe(
                mergeMap(() => forkJoin([projMetaStatus$])),
                first(([{ message, content }]) => {
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

                        return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
                    } else {
                        const thumbnailResponse = interval(500).pipe(
                            mergeMap(() => projLoadingStatus$),
                            first(({ message }) => message === 2),
                            mergeMap(({ uuid_list, label_list }) => {
                                this.labelList = [...label_list];
                                return uuid_list.length > 0
                                    ? uuid_list.map((uuid) => thumbnail$(projectName, uuid))
                                    : [];
                            }),
                        );

                        return thumbnailResponse;
                    }
                }),
                // * this mergeMap responsible for flaten all observable into one layer
                mergeMap((data) => data),
            )
            .subscribe(
                (res) => {
                    this.thumbnailList = [...this.thumbnailList, res];
                    // this.onChangeSchema = {
                    //     ...this.onChangeSchema,
                    //     currentThumbnailIndex: 0,
                    //     totalNumThumbnail: this.thumbnailList.length,

                    // this.tabStatus = [...this.tabStatus, { name: 'Label', closed, label_list: [] }];
                },
                (error: Error) => {},
                () => {
                    // const [{ label_list }] = this.tabStatus;
                    // label_list && label_list.length < 1
                    //     ? this.onProcessLabel({ selectedLabel: '', label_list: [], action: 1 })
                    //     : null;
                    // console.log(this.thumbnailList);

                    this._router.navigate([`imglabel/${this.imgLblMode}`], {
                        state: { thumbnailList: this.thumbnailList, projectName, labelList: this.labelList },
                    });
                    this._spinnerService.hideSpinner();
                },
            );
        // make initial call
        this.subject$.next();
    };

    createProject = (projectName: string): void => {
        const createProj$ = this._dataSetService.createNewProject(projectName);
        const updateLabel$ = this._dataSetService.updateLabelList(projectName, this.labelTextUpload);
        const uploadStatus$ = this._dataSetService.localUploadStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;
        let numberOfReq: number = 0;

        const returnResponse = ({ message }: Message): Observable<BboxMetadata & PolyMetadata> => {
            return message !== 5 && message === 1
                ? interval(500).pipe(
                      mergeMap(() => uploadStatus$),
                      /** @property {number} message value 4 means upload completed, value 1 means cancelled */
                      first(({ message }) => {
                          this.isOverlayOn = message === 0 || message === 2 ? true : false;
                          this.isImageUploading = message === 2 ? true : false;
                          const isValidResponse: boolean = message === 4 || message === 1;
                          return isValidResponse;
                      }),
                      mergeMap(({ uuid_list, message }) => {
                          /** @property {number} message if value 4 means client has received uploaded item(s) */
                          const thumbnails =
                              message === 4 && uuid_list.length > 0
                                  ? uuid_list.map((uuid) => thumbnail$(projectName, uuid))
                                  : [];
                          this.projectList =
                              thumbnails.length > 0
                                  ? { ...this.projectList, isUploading: true }
                                  : { ...this.projectList, isUploading: false };
                          numberOfReq = thumbnails.length;
                          if (message === 4) {
                              this.toggleModalDisplay(false);
                          }
                          return thumbnails;
                      }),
                      // * this mergeMap responsible for flaten all observable into one layer
                      mergeMap((data) => data),
                  )
                : throwError((error: any) => {
                      console.error(error);
                      this.projectList = { ...this.projectList, isUploading: false };
                      return error;
                  });
        };
        this.projectList = { ...this.projectList, isUploading: true };
        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                mergeMap(() => createProj$),
                mergeMap(() => updateLabel$),
                mergeMap((val) => returnResponse(val)),
            )
            .subscribe(
                (res) => {
                    numberOfReq = res ? --numberOfReq : numberOfReq;
                    numberOfReq < 1 && (this.projectList = { ...this.projectList, isUploading: false });
                },
                (error: Error) => {},
                () => {
                    this.getProjectList();
                },
            );

        // make initial call
        this.subject$.next();
    };

    deleteProject = (projectName: string): void => {
        const deleteProj$ = this._dataSetService.deleteProject(projectName);

        deleteProj$
            .pipe(
                first(),
                map(({ message }) => message),
            )
            .subscribe((message) => {
                if ((message = 1)) {
                    this._languageService._translate.get('deleteSuccess').subscribe((translated: any) => {
                        alert(projectName + ' ' + translated);
                    });
                    this.getProjectList();
                }
            });
    };

    @HostListener('window:keydown', ['$event'])
    keyDownEvent = ({ key }: KeyboardEvent): void => {
        key === 'Escape' && this.displayModal && this.toggleModalDisplay(false);
    };

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
