/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
import {
    LabelList,
    Labels,
    Folder,
    Videos,
    VideoProject,
    VideoFramesExtractionStatus,
    SingleExtractionInfo,
    MultipleExtractionInfo,
} from '../../shared/types/dataset-layout/data-set-layout.model';
import { HttpClient } from '@angular/common/http';
import { VideoLabellingModeService } from 'components/video-labelling/video-labelling-mode.service';
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
} from 'shared/types/message/message.model';
import { UnsupportedImageService } from 'shared/services/unsupported-image.service';
import { VideoLabellingMode, BboxMetadata, PolyMetadata } from 'shared/types/Video-labelling/Video-labelling.model';

@Injectable({ providedIn: 'any' })
export class VideoDataSetLayoutApiService {
    private hostPort: string = environment.baseURL;
    private videoLabellingMode: VideoLabellingMode = null;

    constructor(
        private http: HttpClient,
        private mode: VideoLabellingModeService,
        private router: Router,
        private _unsupportedImageService: UnsupportedImageService,
    ) {
        // if has mode value, acquire the mode value
        // else return to lading page
        this.mode.videoLabelMode$.pipe(distinctUntilChanged()).subscribe((modeVal) => {
            if (modeVal) {
                this.videoLabellingMode = modeVal;
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    getProjectList = (): Observable<MessageContent<VideoProject[]>> => {
        return this.http.get<MessageContent<VideoProject[]>>(
            `${this.hostPort}${this.videoLabellingMode}/projects/meta`,
        );
        // .pipe(catchError(this.handleError));
    };

    createNewProject = (
        projectName: string,
        labelPath: string,
        projectFolderPath: string,
        videoPath: string,
    ): Observable<ProjectMessage> => {
        const annotationType = this.videoLabellingMode === 'videobndbox' ? 'videoboundingbox' : 'videosegmentation';
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/videoprojects`, {
            project_name: projectName,
            annotation_type: annotationType,
            status: 'raw',
            project_path: projectFolderPath,
            label_file_path: labelPath,
            video_file_path: videoPath,
        });
    };

    importProject = (): Observable<ProjectMessage> => {
        return this.http.put<ProjectMessage>(`${this.hostPort}v2/projects`, {
            status: 'config',
        });
    };

    renameProject = (oldProjectName: string, newProjectName: string): Observable<Message> => {
        return this.http.put<Message>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${oldProjectName}/rename/${newProjectName}`,
            {},
        );
    };

    deleteProject = (projectName: string): Observable<Message> => {
        return this.http.delete<Message>(`${this.hostPort}${this.videoLabellingMode}/projects/${projectName}`);
    };

    updateProjectLoadStatus = (projectName: string): Observable<Message> => {
        return this.http.get<Message>(`${this.hostPort}${this.videoLabellingMode}/projects/${projectName}`);
    };

    checkProjectStatus = (projectName: string): Observable<MessageContent<VideoProject[]>> => {
        return this.http.get<MessageContent<VideoProject[]>>(
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/meta`,
        );
    };

    manualCloseProject = (projectName: string, status = 'closed'): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.videoLabellingMode}/projects/${projectName}`, {
            status,
        });
    };

    checkExistProjectStatus = (projectName: string): Observable<LabelList> => {
        return this.http.get<LabelList>(
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/loadingstatus`,
        );
    };

    getThumbnailList = (projectName: string, uuid: string): Observable<BboxMetadata & PolyMetadata> => {
        return this.http.get<BboxMetadata & PolyMetadata>(
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/uuid/${uuid}/thumbnail`,
        );
    };

    localUploadStatus = (projectName: string): Observable<MessageUploadStatus> => {
        return this.http.get<MessageUploadStatus>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/newlabels`, {
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
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/${conditionalEndPoint}`,
            {
                // status: 'true',
                status: loading.toString(),
            },
        );
    };

    importStatus = (): Observable<ImportResponse> => {
        return this.http.get<ImportResponse>(`${this.hostPort}v2/${this.videoLabellingMode}/projects/importstatus`);
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

    importVideoFile() {
        return this.http.put<Message>(`${this.hostPort}v2/videofiles`, {});
    }

    importVideoFileStatus() {
        return this.http.get<Videos>(`${this.hostPort}v2/videofiles`);
    }

    downloadUnsupportedImageList(projectName: string, unsupportedImageList: string[]) {
        return this._unsupportedImageService.downloadUnsupportedImageList(projectName, unsupportedImageList);
    }

    initiateVideoExtraction(
        videoFilePath: string,
        projectName: string,
        partition: number,
        extractedFrameIndex: number,
    ) {
        const annotationType = this.videoLabellingMode === 'videobndbox' ? 'videoboundingbox' : 'videosegmentation';

        return this.http.post<Videos>(`${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/extract`, {
            video_file_path: videoFilePath,
            project_name: projectName,
            annotation_type: annotationType,
            extraction_partition: partition,
            extracted_frame_index: extractedFrameIndex,
        });
    }

    extractSpecificFrame(videoFilePath: string, projectName: string, currentTime: number) {
        const annotationType = this.videoLabellingMode === 'videobndbox' ? 'videoboundingbox' : 'videosegmentation';

        return this.http.post<SingleExtractionInfo>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/extract`,
            {
                video_file_path: videoFilePath,
                project_name: projectName,
                annotation_type: annotationType,
                current_time: currentTime,
            },
        );
    }

    extractFramesForSelectedTimeRange(videoFilePath: string, projectName: string, startTime: number, endTime: number) {
        const annotationType = this.videoLabellingMode === 'videobndbox' ? 'videoboundingbox' : 'videosegmentation';

        return this.http.post<MultipleExtractionInfo>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/multipleextract`,
            {
                video_file_path: videoFilePath,
                project_name: projectName,
                annotation_type: annotationType,
                extraction_start_time: startTime,
                extraction_end_time: endTime,
            },
        );
    }

    videoExtractionStatus(projectName: string) {
        return this.http.get<VideoFramesExtractionStatus>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/extractstatus`,
        );
    }
}
