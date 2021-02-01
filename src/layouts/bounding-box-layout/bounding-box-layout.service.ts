import { BboxMetadata } from 'src/components/image-labelling/image-labelling.model';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message, MessageBase64Img, MessageProjectProgress } from 'src/shared/types/message/message.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'any' })
export class BoundingBoxService {
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
        thumbnailMetaData: BboxMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...thumbnailMetaData,
            },
        );
    };

    setLocalStorageProjectProgress = (projectName: string, annotation: BboxMetadata[] | undefined) => {
        localStorage.setItem(`${projectName}_bb`, JSON.stringify({ cache: annotation }));
    };

    getLocalStorageProjectProgress = (projectName: string): BboxMetadata | null => {
        const result = localStorage.getItem(`${projectName}_bb`);
        const jsonResult: BboxMetadata | null = result ? JSON.parse(result) : null;
        return jsonResult;
    };
}
