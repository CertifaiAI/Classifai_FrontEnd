import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { ImageLabellingModeService } from './image-labelling-mode.service';
import { Injectable } from '@angular/core';
import {
    ExportResponse,
    Message,
    MessageBase64Img,
    MessageProjectProgress,
    MessageReload,
    uuid,
} from 'src/shared/types/message/message.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CompleteMetadata, ImageLabellingMode } from 'src/components/image-labelling/image-labelling.model';

@Injectable({ providedIn: 'any' })
export class ImageLabellingApiService {
    private hostPort: string = environment.baseURL;
    public imageLabellingMode: ImageLabellingMode = null;

    constructor(private http: HttpClient, private mode: ImageLabellingModeService, private router: Router) {
        this.mode.imgLabelMode$
            .pipe(distinctUntilChanged())
            .subscribe((modeVal) => (modeVal ? (this.imageLabellingMode = modeVal) : this.router.navigate(['/'])));
    }

    getBase64Thumbnail = (projectName: string, uuid: uuid): Observable<MessageBase64Img> => {
        return this.http.get<MessageBase64Img>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/uuid/${uuid}/imgsrc`,
        );
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/newlabels`, {
            label_list,
        });
    };

    updateProjectProgress = (
        projectName: string,
        uuid: uuid,
        metadata: CompleteMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...metadata,
            },
        );
    };

    checkIfBboxMetaType(
        metadata: CompleteMetadata | CompleteMetadata[],
    ): metadata is CompleteMetadata | CompleteMetadata[] {
        if (Array.isArray(metadata)) {
            return (metadata as CompleteMetadata[])[0].bnd_box !== undefined;
        } else {
            return (metadata as CompleteMetadata).bnd_box !== undefined;
        }
    }

    exportProject = (projectName: string, exportType: string): Observable<ExportResponse> => {
        return this.http.put<ExportResponse>(
            `${this.hostPort}v2/${this.imageLabellingMode}/projects/${projectName}/export/${exportType}`,
            {
                newprojectid: projectName,
            },
        );
    };

    reloadProject = (projectName: string): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}v2/${this.imageLabellingMode}/projects/${projectName}/reload`, {
            newprojectid: projectName,
        });
    };

    reloadProjectStatus = (projectName: string): Observable<MessageReload> => {
        return this.http.get<MessageReload>(
            `${this.hostPort}v2/${this.imageLabellingMode}/projects/${projectName}/reloadstatus`,
        );
    };
}
