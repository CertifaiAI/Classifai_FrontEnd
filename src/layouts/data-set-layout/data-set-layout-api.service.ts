import { BboxMetadata, ImageLabellingMode, PolyMetadata } from 'src/components/image-labelling/image-labelling.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { FileType, LabelList, Project } from './data-set-layout.model';
import { HttpClient } from '@angular/common/http';
import { ImageLabellingModeService } from 'src/components/image-labelling/image-labelling-mode.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {
    Message,
    MessageContent,
    MessageProjectProgress,
    MessageUuidList,
} from 'src/shared/types/message/message.model';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;
    private imageLabellingMode: ImageLabellingMode = null;

    constructor(private http: HttpClient, private mode: ImageLabellingModeService, private router: Router) {
        // if has mode value, acquire the mode value
        // else return to lading page
        this.mode.imgLabelMode$
            .pipe(distinctUntilChanged())
            .subscribe((modeVal) => (modeVal ? (this.imageLabellingMode = modeVal) : this.router.navigate(['/'])));
    }

    getProjectList = (): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(`${this.hostPort}${this.imageLabellingMode}/projects/meta`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (projectName: string): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/newproject/${projectName}`, {
            newprojectid: projectName,
        });
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/meta`,
        );
    };

    manualCloseProject = (projectName: string, status: 'closed' = 'closed'): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<LabelList> => {
        return this.http.get<LabelList>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/loadingstatus`,
        );
    };

    getThumbnailList = (projectName: string, uuid: string): Observable<BboxMetadata & PolyMetadata> => {
        return this.http.get<BboxMetadata & PolyMetadata>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    /** @function responsible for returning an Observable of data type Message
     *  @param {string} projectName - your current project name
     *  @param {string} fileType - default w/o value is 'folder', else have to provide 'file' as value
     */
    localUploadThumbnail = (projectName: string, fileType: FileType = 'folder'): Observable<Message> => {
        return this.http.get<Message>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/filesys/${fileType}`,
        );
    };

    localUploadStatus = (projectName: string): Observable<MessageUuidList> => {
        return this.http.get<MessageUuidList>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/filesysstatus`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/newlabels`, {
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
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/${conditionalEndPoint}`,
            {
                // status: 'true',
                status: loading.toString(),
            },
        );
    };
}
