/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { BboxMetadata, PolyMetadata } from 'shared/types/labelling-type/image-labelling.model';
import { Folder, LabelList, Labels, Project } from '../../shared/types/dataset-layout/data-set-layout.model';
import {
    ImportResponse,
    Message,
    MessageContent,
    MessageProjectProgress,
    MessageUploadStatus,
    ProjectMessage,
    ProjectStatsResponse,
} from 'shared/types/message/message.model';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LabelModeService } from 'shared/services/label-mode-service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UnsupportedImageService } from 'shared/services/unsupported-image.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;
    private labelMode: string | null = null;
    private annotationType!: string;

    constructor(
        private http: HttpClient,
        private labelModeService: LabelModeService,
        private router: Router,
        private _unsupportedImageService: UnsupportedImageService,
    ) {
        // if has mode value, acquire the mode value
        // else return to lading page
        this.labelModeService.labelMode$.pipe(distinctUntilChanged()).subscribe((labelMode) => {
            if (labelMode) {
                this.labelMode = labelMode;
                this.annotationType = this.labelModeService.getAnnotationType(labelMode);
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    getProjectList = (): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(`${this.hostPort}${this.labelMode}/projects/meta`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (
        projectName: string,
        labelPath: string,
        projectFolderPath: string,
        projectFilePath: string,
    ): Observable<ProjectMessage> => {
        return this.http.post<ProjectMessage>(`${this.hostPort}v2/projects`, {
            project_name: projectName,
            annotation_type: this.annotationType,
            status: 'raw',
            project_path: projectFolderPath,
            label_file_path: labelPath,
            project_file_path: projectFilePath,
        });
    };

    importProject = (): Observable<ProjectMessage> => {
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            status: 'config',
        });
    };

    renameProject = (oldProjectName: string, newProjectName: string): Observable<Message> => {
        return this.http.put<Message>(
            `${this.hostPort}v2/${this.labelMode}/projects/${oldProjectName}/rename/${newProjectName}`,
            {},
        );
    };

    deleteProject = (projectName: string): Observable<Message> => {
        return this.http.delete<Message>(`${this.hostPort}${this.labelMode}/projects/${projectName}`);
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}${this.labelMode}/projects/${projectName}/load`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<Project>> => {
        return this.http.get<MessageContent<Project>>(`${this.hostPort}${this.labelMode}/projects/${projectName}/meta`);
    };

    manualCloseProject = (projectName: string, status = 'closed'): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.labelMode}/projects/${projectName}/close`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<LabelList> => {
        return this.http.get<LabelList>(`${this.hostPort}${this.labelMode}/projects/${projectName}/loadingstatus`);
    };

    getThumbnailList = (projectName: string, uuid: string): Observable<BboxMetadata & PolyMetadata> => {
        return this.http.get<BboxMetadata & PolyMetadata>(
            `${this.hostPort}${this.labelMode}/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    localUploadStatus = (projectName: string): Observable<MessageUploadStatus> => {
        return this.http.get<MessageUploadStatus>(`${this.hostPort}v2/${this.labelMode}/projects/${projectName}`);
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.labelMode}/projects/${projectName}/newlabels`, {
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
            `${this.hostPort}${this.labelMode}/projects/${projectName}/${conditionalEndPoint}`,
            {
                // status: 'true',
                status: loading.toString(),
            },
        );
    };

    importStatus = (): Observable<ImportResponse> => {
        return this.http.get<ImportResponse>(`${this.hostPort}v2/${this.labelMode}/projects/importstatus`);
    };

    importLabelFile() {
        return this.http.put<Message>(`${this.hostPort}v2/labelfiles`, {});
    }

    importLabelFileStatus() {
        return this.http.get<Labels>(`${this.hostPort}v2/labelfiles`);
    }

    importAudioFile() {
        return this.http.put<Message>(`${this.hostPort}v2/audiofile`, {});
    }

    importAudioFileStatus() {
        return this.http.get<Labels>(`${this.hostPort}v2/audiofile`);
    }

    importTabularFile() {
        return this.http.put<Message>(`${this.hostPort}v2/tabularfile`, {});
    }

    importTabularFileStatus() {
        return this.http.get<Labels>(`${this.hostPort}v2/tabularfile`);
    }

    importVideoFile() {
        return this.http.put<Message>(`${this.hostPort}v2/videofile`, {});
    }

    importVideoFileStatus() {
        return this.http.get<Labels>(`${this.hostPort}v2/videofile`);
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

    getProjectStats = (projectName: string): Observable<ProjectStatsResponse> => {
        return this.http.get<ProjectStatsResponse>(
            `${this.hostPort}v2/${this.labelMode}/projects/${projectName}/statistics`,
        );
    };
}
