import { environment } from 'src/environments/environment.prod';
import { FileType } from 'src/shared/type-casting/file-type/file-type.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    IContent,
    IMessage,
    ILabelList,
    IThumbnailMetadata,
    IMessageUuidList,
    IDataSetStatus,
} from '../data-set-layout/data-set-layout.model';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

    getProjectList = (): Observable<IContent> => {
        return this.http.get<IContent>(`${this.hostPort}bndbox/projects/meta`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (projectName: string): Observable<IMessage> => {
        return this.http.put<IMessage>(`${this.hostPort}bndbox/newproject/${projectName}`, {
            newprojectid: projectName,
        });
    };

    updateProjectLoadStatus = (projectName: string): Observable<IMessage> => {
        return this.http.get<IMessage>(`${this.hostPort}bndbox/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<IContent> => {
        return this.http.get<IContent>(`${this.hostPort}bndbox/projects/${projectName}/meta`);
    };

    manualCloseProject = (projectName: string, status: 'closed'): Observable<IMessage> => {
        return this.http.put<IMessage>(`${this.hostPort}bndbox/projects/${projectName}`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<ILabelList> => {
        return this.http.get<ILabelList>(`${this.hostPort}bndbox/projects/${projectName}/loadingstatus`);
    };

    getThumbnailList = (projectName: string, uuid: number): Observable<IThumbnailMetadata> => {
        return this.http.get<IThumbnailMetadata>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    /** @function responsible for returning an Observable of data type IMessage
     *  @param {string} projectName - your current project name
     *  @param {string} fileType - default w/o value is 'folder', else have to provide 'file' as value
     */
    localUploadThumbnail = (projectName: string, fileType: FileType = 'folder'): Observable<IMessage> => {
        return this.http.get<IMessage>(`${this.hostPort}bndbox/projects/${projectName}/filesys/${fileType}`);
    };

    localUploadStatus = (projectName: string): Observable<IMessageUuidList> => {
        return this.http.get<IMessageUuidList>(`${this.hostPort}bndbox/projects/${projectName}/filesysstatus`);
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<IMessage> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<IMessage>(`${this.hostPort}bndbox/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };

    updateProjectStatus = (
        projectName: string,
        loading: boolean,
        action: 'star' | 'loaded',
    ): Observable<IDataSetStatus> => {
        const conditionalEndPoint = action === 'loaded' ? 'status' : action;
        return this.http.put<IDataSetStatus>(`${this.hostPort}bndbox/projects/${projectName}/${conditionalEndPoint}`, {
            // status: 'true',
            status: loading.toString(),
        });
    };
}
