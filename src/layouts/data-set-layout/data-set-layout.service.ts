import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    IContent,
    IMessage,
    ILabelList,
    IThumbnailMetadata,
    IMessageUuidList,
} from '../data-set-layout/data-set-layout.model';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

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

    updateLabelList = (projectName: string, label_list: string[]): Observable<IMessage> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<IMessage>(`${this.hostPort}bndbox/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };
}
