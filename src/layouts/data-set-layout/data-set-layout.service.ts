import { BboxMetadata, PolyMetadata } from 'src/components/image-labelling/image-labelling.model';
import { environment } from 'src/environments/environment.prod';
import { FileType, LabelList, Project } from './data-set-layout.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
    Message,
    MessageContent,
    MessageProjectProgress,
    MessageUuidList,
} from 'src/shared/types/message/message.model';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

    getProjectList = (): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(`${this.hostPort}bndbox/projects/meta`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (projectName: string): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}bndbox/newproject/${projectName}`, {
            newprojectid: projectName,
        });
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}bndbox/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(`${this.hostPort}bndbox/projects/${projectName}/meta`);
    };

    manualCloseProject = (projectName: string, status: 'closed' = 'closed'): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}bndbox/projects/${projectName}`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<LabelList> => {
        return this.http.get<LabelList>(`${this.hostPort}bndbox/projects/${projectName}/loadingstatus`);
    };

    getThumbnailList = (projectName: string, uuid: number): Observable<BboxMetadata & PolyMetadata> => {
        return this.http.get<BboxMetadata & PolyMetadata>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    /** @function responsible for returning an Observable of data type Message
     *  @param {string} projectName - your current project name
     *  @param {string} fileType - default w/o value is 'folder', else have to provide 'file' as value
     */
    localUploadThumbnail = (projectName: string, fileType: FileType = 'folder'): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}bndbox/projects/${projectName}/filesys/${fileType}`);
    };

    localUploadStatus = (projectName: string): Observable<MessageUuidList> => {
        return this.http.get<MessageUuidList>(`${this.hostPort}bndbox/projects/${projectName}/filesysstatus`);
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<Message>(`${this.hostPort}bndbox/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };

    updateProjectStatus = (
        projectName: string,
        loading: boolean,
        action: 'star' | 'loaded',
    ): Observable<MessageProjectProgress> => {
        const conditionalEndPoint = action === 'loaded' ? 'status' : action;
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}bndbox/projects/${projectName}/${conditionalEndPoint}`,
            {
                // status: 'true',
                status: loading.toString(),
            },
        );
    };
}
