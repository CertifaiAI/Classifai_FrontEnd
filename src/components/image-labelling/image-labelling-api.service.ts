/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import {
    AddImageResponse,
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
import { CompleteMetadata } from 'shared/types/labelling-type/image-labelling.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
import { LabelModeService } from '../../shared/services/label-mode-service';

@Injectable({ providedIn: 'any' })
export class ImageLabellingApiService {
    private hostPort: string = environment.baseURL;
    public annotationType!: string;

    constructor(private http: HttpClient, private labelModeService: LabelModeService, private router: Router) {
        this.labelModeService.labelMode$.pipe(distinctUntilChanged()).subscribe((labelMode) => {
            if (labelMode) {
                this.annotationType = labelMode;
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    getBase64Thumbnail = (projectName: string, uuid: UUID): Observable<MessageBase64Img> => {
        return this.http.get<MessageBase64Img>(
            `${this.hostPort}${this.annotationType}/projects/${projectName}/uuid/${uuid}/imgsrc`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.annotationType}/projects/${projectName}/newlabels`, {
            label_list,
        });
    };

    updateProjectProgress = (
        projectName: string,
        uuid: UUID,
        metadata: CompleteMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}${this.annotationType}/projects/${projectName}/uuid/${uuid}/update`,
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
            `${this.hostPort}v2/${this.annotationType}/projects/${projectName}/export/${exportType}`,
            {
                newprojectid: projectName,
            },
        );
    };

    exportProjectStatus() {
        return this.http.get<ExportStatus>(`${this.hostPort}v2/${this.annotationType}/projects/exportstatus`);
    }

    reloadProject = (projectName: string): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}v2/${this.annotationType}/projects/${projectName}/reload`, {
            newprojectid: projectName,
        });
    };

    reloadProjectStatus = (projectName: string): Observable<MessageReload> => {
        return this.http.get<MessageReload>(
            `${this.hostPort}v2/${this.annotationType}/projects/${projectName}/reloadstatus`,
        );
    };

    renameImage = (uuid: UUID, newImageName: string, projectName: string): Observable<MessageRenameImg> => {
        return this.http.put<MessageRenameImg>(
            `${this.hostPort}v2/${this.annotationType}/projects/${projectName}/imgsrc/rename`,
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
            `${this.hostPort}v2/${this.annotationType}/projects/${projectName}/uuids`,
            options,
        );
    };

    submitSelectedImageFile = (
        projectName: string,
        imageNameList: string[],
        imageBase64List: string[],
    ): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}v2/${this.annotationType}/projects/${projectName}/add`, {
            img_name_list: imageNameList,
            img_base64_list: imageBase64List,
        });
    };

    addImagesStatus = (projectName: string): Observable<AddImageResponse> => {
        return this.http.get<AddImageResponse>(
            `${this.hostPort}v2/${this.annotationType}/projects/${projectName}/addstatus`,
        );
    };
}
