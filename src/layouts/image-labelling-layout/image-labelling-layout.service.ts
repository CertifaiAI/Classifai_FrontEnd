import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
    IContent,
    ILabelList,
    IMessage,
    IThumbnailMetadata,
    IMessageUuidList,
    IBase64Img,
} from './image-labelling-layout.model';

@Injectable({ providedIn: 'any' })
export class ImageLabellingService {
    private hostPort: string = environment.baseURL;

    // /** @state mainly used for set state */
    // private loadingSubject = new BehaviorSubject<ILoading>({
    //   submitLoading: false,
    //   createLoading: false,
    // });

    // /** @state mainly used to get state */
    // loading$ = this.loadingSubject.asObservable();

    // private readonly responseOptions = {
    //   // responseType: 'json' as const,
    //   observe: 'response' as const,
    // };

    private readonly headers = {
        headers: new HttpHeaders({
            'Content-type': 'application/json',
        }),
    };

    constructor(private http: HttpClient) {}

    mapToJson = (res: Response): Promise<any> => res.json();

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = error.message
            ? error.message
            : error.status
            ? `${error.status} - ${error.statusText}`
            : 'Server error';
        console.log(errMsg); // log to console instead
        return throwError(error);
    }

    // /**
    //  * @function responsible for setting state for loading
    //  * @param {boolean} submitLoading - State indicates whether submit btn is loading
    //  * @param {boolean} createLoading - State indicates whether create btn is loading
    //  */
    // setLoadingtate({ submitLoading, createLoading }: ILoading): void {
    //   this.loadingSubject.next({
    //     submitLoading,
    //     createLoading,
    //   });
    // }

    // /**
    //  * @function responsible for getting state for loading
    //  * @return {Object.<boolean>} getValue() is used due to not an async request
    //  */
    // getLoadingState = () => {
    //   return this.loadingSubject.getValue();
    // };

    getProjectList = (): Observable<IContent> => {
        return this.http.get<IContent>(`${this.hostPort}bndbox/projects`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (projectName: string): Observable<IMessage> => {
        return this.http.put<IMessage>(`${this.hostPort}bndbox/newproject/${projectName}`, {
            newprojectid: projectName,
        });
    };

    checkExistProject = (projectName: string): Observable<IMessage> => {
        return this.http.get<IMessage>(`${this.hostPort}bndbox/projects/${projectName}`);
    };

    checkExistProjectStatus = (projectName: string): Observable<ILabelList> => {
        return this.http.get<ILabelList>(`${this.hostPort}bndbox/projects/${projectName}/loadingstatus`);
    };

    getThumbnailList = (projectName: string, uuid: number): Observable<IThumbnailMetadata> => {
        return this.http.get<IThumbnailMetadata>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    localUploadThumbnail = (projectName: string, fileType: string = 'folder'): Observable<IMessage> => {
        return this.http.get<IMessage>(`${this.hostPort}bndbox/projects/${projectName}/filesys/${fileType}`);
    };

    localUploadStatus = (projectName: string): Observable<IMessageUuidList> => {
        return this.http.get<IMessageUuidList>(`${this.hostPort}bndbox/projects/${projectName}/filesysstatus`);
    };

    getBase64Thumbnail = (projectName: string, uuid: number): Observable<IBase64Img> => {
        return this.http.get<IBase64Img>(`${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/imgsrc`);
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<IMessage> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<IMessage>(`${this.hostPort}bndbox/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };
}
