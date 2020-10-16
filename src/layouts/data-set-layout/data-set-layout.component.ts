import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DataSetLayoutService } from './data-set-layout.service';
import { DataSetProps, IMessage, IThumbnailMetadata, projectSchema } from './data-set-layout.model';
import { first, flatMap, map, mergeMap, takeUntil } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/shared/components/spinner/spinner.service';

@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: DataSetProps;
    projectList: projectSchema = {
        projects: [],
        isUploading: false,
    };
    inputProjectName: string = '';
    selectedProjectName: string = '';
    labelTextUpload: any[] = [];
    form!: FormGroup;
    displayModal: boolean = false;
    subject$: Subject<any> = new Subject();
    subjectSubscription!: Subscription;
    thumbnailList: IThumbnailMetadata[] = [];
    labelList: string[] = [];
    loading: boolean = false;
    unsubscribe$: Subject<any> = new Subject();

    constructor(
        private _fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _router: Router,
        private _dataSetService: DataSetLayoutService,
        private _spinnerService: SpinnerService,
    ) {
        this._spinnerService
            .returnAsObservable()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((loading) => (this.loading = loading));

        this.createFormControls();

        this._dataSetService
            .getProjectList()
            .pipe(first())
            .subscribe(({ content }) => (this.projectList.projects = content)),
            (error: Error) => {
                console.error(error);
            };
    }

    ngOnInit(): void {}

    createFormControls = (): void => {
        this.form = this._fb.group({
            projectName: ['', Validators.required],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    toggleModalDisplay = (shown: boolean): void => {
        this.form.reset();
        this.displayModal = shown;
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
                    this.labelTextUpload.push(...newLabelArray);
                    // console.log(this.labelTextUpload);
                }
            };
            // console.log(file);
            reader.readAsText(file);
        }
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
                    ? this.projectList.projects.find((project) => (project ? project === this.inputProjectName : null))
                    : null;
                checkExistProject
                    ? this.form.get('projectName')?.setErrors({ exist: true })
                    : (this.createProject(this.inputProjectName),
                      (this.selectedProjectName = this.form.get('projectName')?.value));
            } else {
                this.form.get('projectName')?.setErrors({ required: true });
            }
        }
    };

    startProject = (projectName: string): void => {
        const streamProj$ = this._dataSetService.checkExistProject(projectName);
        const streamProjStatus$ = this._dataSetService.checkExistProjectStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;

        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                flatMap(() => forkJoin([streamProj$, streamProjStatus$])),
                mergeMap(([, { message, uuid_list, label_list }]) => {
                    if (message === 2) {
                        this.labelList = [...label_list];
                        // this.tabStatus = this.tabStatus.map((tab) =>
                        //     tab.label_list ? (tab.label_list = label_list) && tab : tab,
                        // );
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
                    // this.onChangeSchema = {
                    //     ...this.onChangeSchema,
                    //     currentThumbnailIndex: 0,
                    //     totalNumThumbnail: this.thumbnailList.length,

                    // this.tabStatus = [...this.tabStatus, { name: 'Label', closed, label_list: [] }];
                },
                (error: Error) => console.error(error),
                () => {
                    // const [{ label_list }] = this.tabStatus;
                    // label_list && label_list.length < 1
                    //     ? this.onProcessLabel({ selectedLabel: '', label_list: [], action: 1 })
                    //     : null;
                    // console.log(this.thumbnailList);

                    this._router.navigate(['imglabel'], {
                        state: { thumbnailList: this.thumbnailList, projectName, labelList: this.labelList },
                    });
                },
            );

        // make initial call
        this.subject$.next();
    };

    uploadThumbnail = (projectName: string = this.inputProjectName): void => {
        const uploadType$ = this._dataSetService.localUploadThumbnail(projectName);
        const uploadStatus$ = this._dataSetService.localUploadStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;
        let numberOfReq: number = 0;

        const returnResponse = <T extends IMessage>({ message }: T): Observable<IThumbnailMetadata> => {
            return message !== 5 && message === 1
                ? interval(500).pipe(
                      flatMap(() => uploadStatus$),
                      /** @property {number} message value 4 means upload completed, value 1 means cancelled */
                      first(({ message }) => {
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
                          return thumbnails;
                      }),
                      // * this flatMap responsible for flaten all observable into one layer
                      flatMap((data) => data),
                  )
                : throwError((error: any) => {
                      console.error(error);
                      this.projectList = { ...this.projectList, isUploading: false };
                      return error;
                  });

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
        this.projectList = { ...this.projectList, isUploading: true };
        this.subjectSubscription = this.subject$
            .pipe(
                first(),
                flatMap(() => uploadType$),
                mergeMap((val) => returnResponse(val)),
            )
            .subscribe((res) => {
                numberOfReq = res ? --numberOfReq : numberOfReq;
                numberOfReq < 1 ? (this.projectList = { ...this.projectList, isUploading: false }) : null;
            });

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

    // onProcessLabel = <T extends SelectedLabelProps>({ selectedLabel, label_list, action }: T) => {
    //     // console.log(selectedLabel, label_list, action);
    //     const newLabelList: string[] =
    //         selectedLabel && !action ? label_list.filter((label) => label !== selectedLabel) : label_list;
    //     const projectName: string = this.selectedProjectName || this.inputProjectName;
    //     const updateLabel$ = this._imgLabelService.updateLabelList(
    //         projectName,
    //         newLabelList.length > 0 ? newLabelList : [],
    //     );

    //     updateLabel$.pipe(first()).subscribe(({ message }) => {
    //         message === 1
    //             ? (this.tabStatus = this.tabStatus.map((tab) => {
    //                   if (tab.label_list) {
    //                       // const newLabelList = tab.label_list.filter((label) => label !== selectedLabel);
    //                       return {
    //                           ...tab,
    //                           label_list: newLabelList,
    //                       };
    //                   }
    //                   return tab;
    //               }))
    //             : console.error(`Error while updating label`);
    //     });
    // };

    // setLabelListLocalStorage = (labelList: ILabelList): void => {
    //     console.log(labelList);
    // };

    createProject = (projectName: string): void => {
        const createProj$ = this._dataSetService.createNewProject(projectName);
        const updateLabel$ = this._dataSetService.updateLabelList(projectName, this.labelTextUpload);

        createProj$
            .pipe(
                first(),
                map(({ message }) => message),
                mergeMap(() => updateLabel$),
            )
            .subscribe(({ message }) => {
                message === 1
                    ? ((this.projectList = { projects: [projectName], ...this.projectList }),
                      (this.displayModal = false))
                    : null;
            });
    };

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
