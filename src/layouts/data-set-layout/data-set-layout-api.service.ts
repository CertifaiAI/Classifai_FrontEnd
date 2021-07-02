/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BboxMetadata, ImageLabellingMode, PolyMetadata } from 'src/components/image-labelling/image-labelling.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { LabelList, Labels, Project, Folder } from './data-set-layout.model';
import { HttpClient } from '@angular/common/http';
import { ImageLabellingModeService } from 'src/components/image-labelling/image-labelling-mode.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {
    Message,
    MessageContent,
    MessageProjectProgress,
    MessageUploadStatus,
    ImportResponse,
    ProjectMessage,
} from 'src/shared/types/message/message.model';
import { UnsupportedImageService } from 'src/shared/services/unsupported-image.service';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;
    private imageLabellingMode: ImageLabellingMode = null;

    constructor(
        private http: HttpClient,
        private mode: ImageLabellingModeService,
        private router: Router,
        private _unsupportedImageService: UnsupportedImageService,
    ) {
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

    createNewProject = (
        projectName: string,
        labelPath: string,
        projectFolderPath: string,
    ): Observable<ProjectMessage> => {
        const annotationType = this.imageLabellingMode === 'bndbox' ? 'boundingbox' : 'segmentation';
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            project_name: projectName,
            annotation_type: annotationType,
            status: 'raw',
            project_path: projectFolderPath,
            label_file_path: labelPath,
        });
    };

    importProject = (): Observable<ProjectMessage> => {
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            status: 'config',
        });
    };

    renameProject = (oldProjectName: string, newProjectName: string): Observable<Message> => {
        return this.http.put<Message>(
            `${this.hostPort}v2/${this.imageLabellingMode}/projects/${oldProjectName}/rename/${newProjectName}`,
            {},
        );
    };

    deleteProject = (projectName: string): Observable<Message> => {
        return this.http.delete<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}`);
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/meta`,
        );
    };

    manualCloseProject = (projectName: string, status = 'closed'): Observable<Message> => {
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

    localUploadStatus = (projectName: string): Observable<MessageUploadStatus> => {
        return this.http.get<MessageUploadStatus>(
            `${this.hostPort}v2/${this.imageLabellingMode}/projects/${projectName}`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/newlabels`, {
            label_list,
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

    importStatus = (): Observable<ImportResponse> => {
        return this.http.get<ImportResponse>(`${this.hostPort}v2/${this.imageLabellingMode}/projects/importstatus`);
    };

    importLabelFile() {
        return this.http.put<Message>(`${this.hostPort}v2/labelfiles`, {});
    }

    importLabelFileStatus() {
        return this.http.get<Labels>(`${this.hostPort}v2/labelfiles`);
    }

    importProjectFolder() {
        return this.http.put<Message>(`${this.hostPort}v2/folders`, {});
    }

    importProjectFolderStatus() {
        return this.http.get<Folder>(`${this.hostPort}v2/folders`);
    }

    downloadUnsupportedImageList(projectName: string, unsupportedImageList: string[]) {
        return this._unsupportedImageService.downloadUnsupportedImageList(projectName, unsupportedImageList);
    }
}
