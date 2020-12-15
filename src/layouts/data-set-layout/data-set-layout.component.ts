// import * as AWS from 'aws-sdk';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { DataSetLayoutService } from './data-set-layout.service';
// import { environment } from './../../environments/environment';
import { first, map, mergeMap, takeUntil } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HTMLElementEvent } from 'src/shared/type-casting/field/field.model';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/shared/components/spinner/spinner.service';
import {
    DataSetProps,
    Message,
    ThumbnailMetadata,
    ProjectSchema,
    UploadThumbnailProps,
    StarredProps,
} from './data-set-layout.model';
@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit, OnDestroy {
    onChangeSchema!: DataSetProps;
    projectList: ProjectSchema = {
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
    thumbnailList: ThumbnailMetadata[] = [];
    labelList: string[] = [];
    loading: boolean = false;
    unsubscribe$: Subject<any> = new Subject();
    @ViewChild('refProjectName') _refProjectName!: ElementRef<HTMLInputElement>;

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
        this.getProjectList();
    }

    ngOnInit(): void {
        // const wasabiEndpoint = new AWS.Endpoint('s3.eu-central-1.wasabisys.com');
        // const s3 = new AWS.S3({
        //     endpoint: wasabiEndpoint,
        //     credentials: {
        //         accessKeyId: environment.awsAccessKeyId,
        //         secretAccessKey: environment.awsSecretAccessKey,
        //     },
        // });
        // console.log(s3);
        // const filePath = '../../assets/landing-page/Classifai_Thumbnail_Tabular.jpg';
        // const params: AWS.S3.PutObjectRequest = {
        //     Bucket: environment.awsBucketName,
        //     Key: `images/Classifai_Thumbnail_Tabular.jpg`,
        //     Body: filePath,
        //     // ContentType: 'application/octet-stream',
        // };
        // const options: AWS.S3.ManagedUpload.ManagedUploadOptions = {
        //     partSize: 10 * 1024 * 1024, // 10 MB
        //     queueSize: 10,
        // };
        // s3.upload(params, options, (err, data) => {
        //     if (!err) {
        //         console.log(data); // successful response
        //     } else {
        //         console.log(err); // an error occurred
        //     }
        // });
    }

    getProjectList = (): void => {
        this._dataSetService
            .getProjectList()
            .pipe(first())
            .subscribe(({ content }) => {
                if (content) {
                    const clonedProjectList = cloneDeep(content);
                    // const sortedProject = clonedProjectList.sort((a, b) => (b.created_date > a.created_date ? 1 : -1));
                    const formattedProjectList = clonedProjectList.map((project) => {
                        const { created_date } = project;
                        const newProjectList = (project = { ...project, created_date: this.formatDate(created_date) });
                        return newProjectList;
                    });
                    // console.log(formattedProjectList);
                    this.projectList.projects = [...formattedProjectList];
                }
            }),
            (error: Error) => {
                console.error(error);
            };
    };

    formatDate = (date: string): string => {
        const initializedDate: Date = new Date(date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const actualMonth: string =
            monthNames.find((month, i) => i - 1 === initializedDate.getMonth() ?? month) || 'Err';
        const newDateFormat: string = `${actualMonth}-${initializedDate.getDate()}-${initializedDate.getFullYear()}`;
        // console.log(newDateFormat);
        return newDateFormat;
    };

    createFormControls = (): void => {
        this.form = this._fb.group({
            projectName: ['', Validators.required],
            fileUpload: [''],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    toggleModalDisplay = (shown: boolean): void => {
        shown ? this.form.reset() : null;
        this.displayModal = shown;
        /** timeOut needed to allow focus due to Angular's templating sys issue / bug */
        setTimeout(() => this._refProjectName.nativeElement.focus());
    };

    onFileChange = (event: HTMLElementEvent<HTMLInputElement>): void => {
        const { files } = event.target;
        const reader = new FileReader();

        if (files && files.length) {
            const file = files.item(0);
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
            file ? reader.readAsText(file) : null;
            this.form.get('fileUpload')?.patchValue(file);
        }
    };

    onStarred = <T extends StarredProps>({ projectName, starred }: T) => {
        this._dataSetService
            .updateProjectStatus(projectName, starred, 'star')
            .pipe(first())
            .subscribe(({ message }) => console.log(message));
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
                      (this.selectedProjectName = this.form.get('projectName')?.value));
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
                first(),
                mergeMap(() => forkJoin([projMetaStatus$])),
                first(([{ message, content }]) => {
                    this.projectList = {
                        isUploading: this.projectList.isUploading,
                        projects: this.projectList.projects.map((project) =>
                            project.project_name === content[0].project_name
                                ? { ...content[0], created_date: project.created_date }
                                : { ...project },
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

    uploadThumbnail = <T extends UploadThumbnailProps>({ projectName = this.inputProjectName, fileType }: T): void => {
        const uploadType$ = this._dataSetService.localUploadThumbnail(projectName, fileType);
        const uploadStatus$ = this._dataSetService.localUploadStatus(projectName);
        const thumbnail$ = this._dataSetService.getThumbnailList;
        let numberOfReq: number = 0;

        const returnResponse = <T extends Message>({ message }: T): Observable<ThumbnailMetadata> => {
            return message !== 5 && message === 1
                ? interval(500).pipe(
                      mergeMap(() => uploadStatus$),
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
                      // * this mergeMap responsible for flaten all observable into one layer
                      mergeMap((data) => data),
                  )
                : throwError((error: any) => {
                      console.error(error);
                      this.projectList = { ...this.projectList, isUploading: false };
                      return error;
                  });

            // if (message === 1) {
            //   const uploadTypeResponse = interval(500).pipe(
            //     mergeMap(() => uploadStatus$),
            //     first(({ message }) => message === 4),
            //     mergeMap(({ uuid_list }) =>
            //       uuid_list.length > 0
            //         ? uuid_list.map((uuid) => thumbnail$(projectName, uuid))
            //         : []
            //     ),
            //     // * this mergeMap responsible for flaten all observable into one layer
            //     mergeMap((data) => data)
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
                mergeMap(() => uploadType$),
                mergeMap((val) => returnResponse(val)),
            )
            .subscribe(
                (res) => {
                    numberOfReq = res ? --numberOfReq : numberOfReq;
                    numberOfReq < 1 ? (this.projectList = { ...this.projectList, isUploading: false }) : null;
                },
                (error: Error) => {},
                () => {
                    this.getProjectList();
                },
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

    // setLabelListLocalStorage = (labelList: LabelList): void => {
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
                message === 1 ? (this.getProjectList(), (this.displayModal = false)) : null;
            });
    };

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
