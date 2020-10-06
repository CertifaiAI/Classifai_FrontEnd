import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataSetCardComponent } from './data-set-card/data-set-card.component';
import { DataSetLayoutService } from './data-set-layout.service';
import { first, flatMap, map, mergeMap } from 'rxjs/operators';
import { forkJoin, interval, Observable, Subject, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ILabelList, IMessage, IThumbnailMetadata } from '../data-set-layout/data-set-layout.model';
import { Props } from '../image-labelling-layout/image-labelling-layout.model';
import { ThemeService } from 'src/shared/services/theme.service';

@Component({
    selector: 'data-set-layout',
    templateUrl: './data-set-layout.component.html',
    styleUrls: ['./data-set-layout.component.scss'],
})
export class DataSetLayoutComponent implements OnInit {
    mediaTheme: MediaQueryList = window.matchMedia('(prefers-color-scheme: light)');
    onChangeSchema!: Props;

    modeldiv!: HTMLDivElement;
    reRender!: DataSetCardComponent;
    projects: string[] = [];
    inputProjectName: string = '';
    labelTextUpload!: FileList;
    labelArr: any[] = [];
    form!: FormGroup;
    subject$: Subject<any> = new Subject();
    subjectSubscription!: Subscription;
    selectedProjectName: string = '';
    thumbnailList: IThumbnailMetadata[] = [];
    selectedThumbnail: string = '';

    constructor(
        private _fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _themeService: ThemeService,
        private _datasetLayoutService: DataSetLayoutService,
    ) {
        this.setState();
        this.createFormControls();
    }

    setState = (): Props => {
        return (this.onChangeSchema = {
            ...this.onChangeSchema,
            theme: this._themeService.getThemeState(),
        });
    };

    ngOnInit = (): void => {
        // this.modeldiv = document.getElementById('model') as HTMLDivElement;
        // this.modeldiv.style.display = 'none';

        this.reRenderFunction();

        this.mediaTheme.addEventListener('change', this.detectBrowserTheme, false);
    };

    ngOnDestroy = (): void => {
        this.mediaTheme.removeEventListener('change', this.detectBrowserTheme, false);
        this.subjectSubscription ? this.subjectSubscription.unsubscribe() : null;
    };

    detectBrowserTheme = (e: any): void => {
        this.onChangeSchema = {
            ...this.onChangeSchema,
            theme: e.matches ? 'dark-theme' : 'light-theme',
        };
    };

    reRenderFunction() {
        this._datasetLayoutService
            .getProjectList()
            .pipe(first())
            .subscribe(({ content }) => (this.projects = content)),
            (error: Error) => {
                console.error(error);
            };
    }

    createFormControls = (): void => {
        this.form = this._fb.group({
            inputProjectName: [''],
        });
    };

    onChange = (val: string): void => {
        this.inputProjectName = val;
    };

    // onFileChange = (event: any): void => {
    //     const { files }: { files: any[] } = event.target;
    //     const reader = new FileReader();

    //     if (files && files.length) {
    //         const [file] = files;

    //         reader.onload = () => {
    //             this.form.patchValue({
    //                 label: reader.result,
    //             });
    //             // need to run CD since file load runs outside of zone
    //             this._cd.markForCheck();
    //         };
    //         reader.onloadend = () => {
    //             const labelResult = reader.result as string;
    //             const labelSplitArr = labelResult.split('\n');
    //             if (labelSplitArr.length > 0) {
    //                 const newLabelArray = labelSplitArr.reduce((prev, curr) => {
    //                     const clearCharLabel = curr.replace(/[^A-Z0-9]+/gi, '').toLowerCase();
    //                     // prev.push(clearCharLabel);
    //                     return prev;
    //                 }, []);
    //                 this.labelArr.push(...newLabelArray);
    //                 // console.log(this.labelArr);
    //             }
    //         };
    //         // console.log(file);
    //         reader.readAsText(file);
    //     }
    // };

    // onSubmit = (isNewProject: boolean): void => {
    //     this.form.markAllAsTouched();

    //     if (!isNewProject) {
    //         if (this.form.get('selectExistProject')?.value) {
    //             this.startProject(this.form.get('selectExistProject')?.value);
    //             this.selectedProjectName = this.form.get('selectExistProject')?.value;
    //         } else {
    //             this.form.get('selectExistProject')?.setErrors({ required: true });
    //         }
    //     }
    //     if (isNewProject) {
    //         if (this.inputProjectName) {
    //             const checkExistProject = this.projects
    //                 ? this.projects.find((project) => (project ? project === this.inputProjectName : null))
    //                 : null;
    //             checkExistProject
    //                 ? this.form.get('inputProjectName')?.setErrors({ exist: true })
    //                 : (this.createProject(this.inputProjectName),
    //                   (this.selectedProjectName = this.form.get('inputProjectName')?.value));
    //             // null;
    //             this.modeldiv.style.display = 'none';
    //             this.form.reset();
    //             this.reRenderFunction();
    //         } else {
    //             this.form.get('inputProjectName')?.setErrors({ required: true });
    //         }
    //     }
    // };

    // startProject = (projectName: string): void => {
    //     const streamProj$ = this._datasetLayoutService.checkExistProject(projectName);
    //     const streamProjStatus$ = this._datasetLayoutService.checkExistProjectStatus(projectName);
    //     const thumbnail$ = this._datasetLayoutService.getThumbnailList;

    //     this.subjectSubscription = this.subject$
    //         .pipe(
    //             first(),
    //             flatMap(() => forkJoin([streamProj$, streamProjStatus$])),
    //             mergeMap(([, { message, uuid_list }]) => {
    //                 if (message === 2) {
    //                     return uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [];
    //                 } else {
    //                     const ThumbnailResponse = interval(500).pipe(
    //                         flatMap(() => streamProjStatus$),
    //                         first(({ message }) => message === 2),
    //                         mergeMap(({ uuid_list }) =>
    //                             uuid_list.length > 0 ? uuid_list.map((uuid) => thumbnail$(projectName, uuid)) : [],
    //                         ),
    //                     );
    //                     return ThumbnailResponse;
    //                 }
    //             }),
    //             // * this flatMap responsible for flaten all observable into one layer
    //             flatMap((data) => data),
    //         )
    //         .subscribe(
    //             (res) => (this.thumbnailList = [...this.thumbnailList, res]),
    //             (error: Error) => console.error(error),
    //             () => {
    //                 // this._modalService.close();
    //                 console.log(this.thumbnailList);
    //             },
    //         );

    //     // make initial call
    //     this.subject$.next();
    // };

    // uploadThumbnail = (projectName: string = this.selectedProjectName || this.inputProjectName): void => {
    //     const uploadType$ = this._datasetLayoutService.localUploadThumbnail(projectName);
    //     const uploadStatus$ = this._datasetLayoutService.localUploadStatus(projectName);
    //     const thumbnail$ = this._datasetLayoutService.getThumbnailList;

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
    //         );
    //     // make initial call
    //     this.subject$.next();
    // };

    // showBase64Image = (uuid: number, projectName: string = this.selectedProjectName || this.inputProjectName): void => {
    //     const getImage$ = this._datasetLayoutService.getBase64Thumbnail(projectName, uuid);

    //     getImage$.pipe(first()).subscribe(
    //         ({ message, img_src, errormessage }) => {
    //             message === 1 ? (this.selectedThumbnail = img_src) : console.error(errormessage);
    //         },
    //         (err: Error) => console.error(err),
    //         () => {},
    //     );
    // };

    // setLabelListLocalStorage = (labelList: ILabelList): void => {
    //     console.log(labelList);
    // };

    // createProject = (projectName: string): void => {
    //     const createProj$ = this._datasetLayoutService.createNewProject(projectName);
    //     const updateLabel$ = this._datasetLayoutService.updateLabel(projectName, this.labelArr);

    //     createProj$
    //         .pipe(
    //             first(),
    //             map(({ message }) => message),
    //             mergeMap(() => updateLabel$),
    //         )
    //         .subscribe(({ message }) => {
    //             console.log(message === 1);
    //             //message === 1 ? this._modalService.close() : null;
    //         });
    // };

    // navigate({ enabled, isclick }: { enabled: boolean; isclick: boolean }): void {
    //     //TODO:
    //     console.log(enabled, isclick);
    //     if (enabled && isclick) {
    //         this.modeldiv.style.display = 'block';
    //     } else {
    //         this.modeldiv.style.display = 'none';
    //         this.form.reset();
    //     }
    // }
}
