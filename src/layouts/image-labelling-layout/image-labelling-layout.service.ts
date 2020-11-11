import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { MessageBase64Img, Message, ThumbnailMetadata, MessageProjectProgress } from './image-labelling-layout.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'any' })
export class ImageLabellingService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

    getBase64Thumbnail = (projectName: string, uuid: number): Observable<MessageBase64Img> => {
        return this.http.get<MessageBase64Img>(`${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/imgsrc`);
    };

    updateLabelList = (projectName: string, label_list: string[]): Observable<Message> => {
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<Message>(`${this.hostPort}bndbox/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };

    updateProjectProgress = (
        projectName: string,
        uuid: number,
        thumbnailMetaData: ThumbnailMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...thumbnailMetaData,
            },
        );
    };
}
