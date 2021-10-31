/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
import { CompleteMetadata, VideoLabellingMode } from 'shared/types/video-labelling/video-labelling.model';
import {
    ExportResponse,
    ExportStatus,
    Message,
    MessageBase64Img,
    MessageDeleteImg,
    MessageProjectProgress,
    MessageReload,
    MessageRenameImg,
    UUID,
} from 'shared/types/message/message.model';
import { VideoLabellingModeService } from './video-labelling-mode.service';

@Injectable({ providedIn: 'any' })
export class VideoLabellingApiService {
    private hostPort: string = environment.baseURL;
    public videoLabellingMode: VideoLabellingMode = null;

    constructor(private http: HttpClient, private mode: VideoLabellingModeService, private router: Router) {
        this.mode.videoLabelMode$.pipe(distinctUntilChanged()).subscribe((modeVal) => {
            if (modeVal) {
                this.videoLabellingMode = modeVal;
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    getBase64Thumbnail = (projectName: string, uuid: UUID): Observable<MessageBase64Img> => {
        return this.http.get<MessageBase64Img>(
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/uuid/${uuid}/imgsrc`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/newlabels`, {
            label_list,
        });
    };

    updateProjectProgress = (
        projectName: string,
        uuid: UUID,
        metadata: CompleteMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}${this.videoLabellingMode}/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...metadata,
            },
        );
    };

    checkIfBboxMetaType(
        metadata: CompleteMetadata | CompleteMetadata[],
    ): metadata is CompleteMetadata | CompleteMetadata[] {
        if (Array.isArray(metadata)) {
            return metadata[0].bnd_box !== undefined;
        } else {
            return metadata.bnd_box !== undefined;
        }
    }

    exportProject = (projectName: string, exportType: string): Observable<ExportResponse> => {
        return this.http.put<ExportResponse>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/export/${exportType}`,
            {
                newprojectid: projectName,
            },
        );
    };

    exportProjectStatus() {
        return this.http.get<ExportStatus>(`${this.hostPort}v2/${this.videoLabellingMode}/projects/exportstatus`);
    }

    reloadProject = (projectName: string): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/reload`, {
            newprojectid: projectName,
        });
    };

    reloadProjectStatus = (projectName: string): Observable<MessageReload> => {
        return this.http.get<MessageReload>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/reloadstatus`,
        );
    };

    renameImage = (uuid: UUID, newImageName: string, projectName: string): Observable<MessageRenameImg> => {
        return this.http.put<MessageRenameImg>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/imgsrc/rename`,
            {
                uuid,
                new_fname: newImageName,
            },
        );
    };

    deleteImage = (uuid: UUID, imgPath: string, projectName: string): Observable<MessageDeleteImg> => {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            body: {
                uuid_list: [uuid],
                img_path_list: [imgPath],
            },
        };
        return this.http.delete<MessageDeleteImg>(
            `${this.hostPort}v2/${this.videoLabellingMode}/projects/${projectName}/uuids`,
            options,
        );
    };
}
