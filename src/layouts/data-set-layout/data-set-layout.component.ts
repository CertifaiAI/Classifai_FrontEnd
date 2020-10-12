import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataSetLayoutService } from './data-set-layout.service';
import { first, flatMap, map, mergeMap } from 'rxjs/operators';
import { forkJoin, interval, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IThumbnailMetadata } from './data-set-layout.model';
import { Props } from '../image-labelling-layout/image-labelling-layout.model';
import { Router } from '@angular/router';

@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit {
    onChangeSchema!: Props;
    projects: string[] = [];
    inputProjectName: string = '';
    selectedProjectName: string = '';
    labelTextUpload!: FileList;
    labelArr: any[] = [];
    form!: FormGroup;
    displayModal: boolean = false;
    subject$: Subject<any> = new Subject();
    subjectSubscription!: Subscription;
    thumbnailList: IThumbnailMetadata[] = [];

    constructor(
        private _fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _router: Router,
        private _dataSetService: DataSetLayoutService,
    ) {
        this.createFormControls();

        this._dataSetService
            .getProjectList()
            .pipe(first())
            .subscribe(({ content }) => (this.projects = content)),
            (error: Error) => {
                console.error(error);
            };
    }

    ngOnInit(): void {}

    createFormControls = (): void => {
        this.form = this._fb.group({
            inputProjectName: ['', Validators.required],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    toggleModalDisplay = (shown: boolean): void => {
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
                    this.labelArr.push(...newLabelArray);
                    // console.log(this.labelArr);
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
                const checkExistProject = this.projects
                    ? this.projects.find((project) => (project ? project === this.inputProjectName : null))
                    : null;
                checkExistProject
                    ? this.form.get('projectName')?.setErrors({ exist: true })
                    : (this.createProject(this.inputProjectName),
                      (this.selectedProjectName = this.form.get('projectName')?.value));
                this.form.reset();
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
                mergeMap(([, { message, uuid_list }]) => {
                    if (message === 2) {
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
                        state: { thumbnailList: this.thumbnailList, projectName },
                    });
                },
            );

        // make initial call
        this.subject$.next();
    };

    // uploadThumbnail = (projectName: string = this.selectedProjectName || this.inputProjectName): void => {
    //     const uploadType$ = this._imgLabelService.localUploadThumbnail(projectName);
    //     const uploadStatus$ = this._imgLabelService.localUploadStatus(projectName);
    //     const thumbnail$ = this._imgLabelService.getThumbnailList;

    //     const returnResponse = <T extends IMessage>({ message }: T): Observable<IThumbnailMetadata> => {
    //         return message === 1
    //             ? interval(500).pipe(
    //                   flatMap(() => uploadStatus$),
    //                   first(({ message }) => message === 4),
    //                   mergeMap(({ uuid_list }) =>
    //                       uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [],
    //                   ),
    //                   // * this flatMap responsible for flaten all observable into one layer
    //                   flatMap((data) => data),
    //               )
    //             : message === 5
    //             ? throwError((err: any) => err)
    //             : throwError((err: any) => err);

    //         // if (message === 1) {
    //         //   const uploadTypeResponse = interval(500).pipe(
    //         //     flatMap(() => uploadStatus$),
    //         //     first(({ message }) => message === 4),
    //         //     mergeMap(({ uuid_list }) =>
    //         //       uuid_list.length > 0
    //         //         ? uuid_list.map((uuid) => thumbnail$(projectName, uuid))
    //         //         : []
    //         //     ),
    //         //     // * this flatMap responsible for flaten all observable into one layer
    //         //     flatMap((data) => data)
    //         //   );
    //         //   return uploadTypeResponse;
    //         // }
    //         // if (message === 5) {
    //         //   catchError((err) => {
    //         //     console.error(err);
    //         //     return of(err);
    //         //   });
    //         // }
    //     };

    //     this.subjectSubscription = this.subject$
    //         .pipe(
    //             first(),
    //             flatMap(() => uploadType$),
    //             mergeMap((val) => returnResponse(val)),
    //         )
    //         .subscribe(
    //             (res) => (this.thumbnailList = [...this.thumbnailList, res]),
    //             (error: Error) => console.error(error),
    //             () => this.displayModal = false,
    //         );
    //     // make initial call
    //     this.subject$.next();

    //     // /** @constant uses Array.from due to props 'type' of FileList are type of Iterable  */
    //     // const arrFiles: File[] = Array.from(files);
    //     // console.log(arrFiles);
    //     // const filteredFiles = arrFiles.filter((file) => {
    //     //   const { type } = file;
    //     //   const validateFileType =
    //     //     type && (type === 'image/jpeg' || type === 'image/png') ? file : null;
    //     //   return validateFileType;
    //     // });
    //     // console.log(filteredFiles);
    // };

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
        const updateLabel$ = this._dataSetService.updateLabelList(projectName, this.labelArr);

        createProj$
            .pipe(
                first(),
                map(({ message }) => message),
                mergeMap(() => updateLabel$),
            )
            .subscribe(({ message }) => {
                message === 1 ? ((this.projects = [projectName, ...this.projects]), (this.displayModal = false)) : null;
            });
    };
}
