/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
import { LabelList, Labels, Project, Folder } from '../../shared/types/dataset-layout/data-set-layout.model';
import { HttpClient } from '@angular/common/http';
import { ImageLabellingModeService } from 'components/image-labelling/image-labelling-mode.service';
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
    ProjectStatsResponse,
    Audio,
} from 'shared/types/message/message.model';
import { UnsupportedImageService } from 'shared/services/unsupported-image.service';
import { ImageLabellingMode, BboxMetadata, PolyMetadata } from 'shared/types/image-labelling/image-labelling.model';
import { LabellingModeService } from '../../shared/services/labelling-mode-service';

@Injectable({ providedIn: 'any' })
export class DataSetLayoutService {
    private hostPort: string = environment.baseURL;
    private imageLabellingMode: ImageLabellingMode = null;
    private labellingMode: string | null = null;

    constructor(
        private http: HttpClient,
        private mode: ImageLabellingModeService,
        private router: Router,
        private _unsupportedImageService: UnsupportedImageService,
        private _labellingModeService: LabellingModeService,
    ) {
        // if has mode value, acquire the mode value
        // else return to lading page
        // this.mode.imgLabelMode$.pipe(distinctUntilChanged()).subscribe((modeVal) => {
        //     if (modeVal) {
        //         this.imageLabellingMode = modeVal;
        //     } else {
        //         this.router.navigate(['/']);
        //     }
        // });

        this._labellingModeService.labelMode$.pipe(distinctUntilChanged()).subscribe((labellingMode) => {
            if (labellingMode) {
                this.labellingMode = labellingMode;
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    getProjectList = (): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(`${this.hostPort}${this.labellingMode}/projects/meta`);
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (
        projectName: string,
        labelPath: string,
        projectFolderPath: string,
        audioFilePath: string,
    ): Observable<ProjectMessage> => {
        let annotationType = '';
        if (this.labellingMode === 'audio') {
            annotationType = 'audio';
        } else if (this.labellingMode === 'bndbox') {
            annotationType = 'boundingbox';
        } else if (this.labellingMode === 'seg') {
            annotationType = 'segmentation';
        }

        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            project_name: projectName,
            annotation_type: annotationType,
            status: 'raw',
            project_path: projectFolderPath,
            label_file_path: labelPath,
            audio_file_path: audioFilePath,
        });
    };

    importProject = (): Observable<ProjectMessage> => {
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            status: 'config',
        });
    };

    renameProject = (oldProjectName: string, newProjectName: string): Observable<Message> => {
        return this.http.put<Message>(
            `${this.hostPort}v2/${this.labellingMode}/projects/${oldProjectName}/rename/${newProjectName}`,
            {},
        );
    };

    deleteProject = (projectName: string): Observable<Message> => {
        return this.http.delete<Message>(`${this.hostPort}${this.labellingMode}/projects/${projectName}`);
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}${this.labellingMode}/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<Project[]>> => {
        return this.http.get<MessageContent<Project[]>>(
            `${this.hostPort}${this.labellingMode}/projects/${projectName}/meta`,
        );
    };

    manualCloseProject = (projectName: string, status = 'closed'): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.labellingMode}/projects/${projectName}`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<LabelList> => {
        return this.http.get<LabelList>(`${this.hostPort}${this.labellingMode}/projects/${projectName}/loadingstatus`);
    };

    getThumbnailList = (projectName: string, uuid: string): Observable<BboxMetadata & PolyMetadata> => {
        return this.http.get<BboxMetadata & PolyMetadata>(
            `${this.hostPort}${this.labellingMode}/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    localUploadStatus = (projectName: string): Observable<MessageUploadStatus> => {
        return this.http.get<MessageUploadStatus>(`${this.hostPort}v2/${this.labellingMode}/projects/${projectName}`);
    };

    updateLabelList = (projectName: string, labelList: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.labellingMode}/projects/${projectName}/newlabels`, {
            label_list: labelList,
        });
    };

    updateProjectStatus = (
        projectName: string,
        loading: boolean,
        action: 'star' | 'loaded',
    ): Observable<MessageProjectProgress> => {
        const conditionalEndPoint = action === 'loaded' ? 'status' : action;
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}${this.labellingMode}/projects/${projectName}/${conditionalEndPoint}`,
            {
                // status: 'true',
                status: loading.toString(),
            },
        );
    };

    importStatus = (): Observable<ImportResponse> => {
        return this.http.get<ImportResponse>(`${this.hostPort}v2/${this.labellingMode}/projects/importstatus`);
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

    importAudioFile() {
        return this.http.put<Message>(`${this.hostPort}v2/audiofile`, {});
    }

    importAudioFileStatus() {
        return this.http.get<Audio>(`${this.hostPort}v2/audiofile`);
    }

    downloadUnsupportedImageList(projectName: string, unsupportedImageList: string[]) {
        return this._unsupportedImageService.downloadUnsupportedImageList(projectName, unsupportedImageList);
    }

    getProjectStats = (projectName: string): Observable<ProjectStatsResponse> => {
        return this.http.get<ProjectStatsResponse>(
            `${this.hostPort}v2/${this.labellingMode}/projects/${projectName}/statistic`,
        );
    };
}
