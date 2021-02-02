import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message, MessageBase64Img, MessageProjectProgress } from 'src/shared/types/message/message.model';
import { Observable } from 'rxjs';
import { PolyMetadata } from 'src/components/image-labelling/image-labelling.model';

@Injectable({ providedIn: 'any' })
export class SegmentationService {
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
        polyMetaData: PolyMetadata,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}bndbox/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...polyMetaData,
            },
        );
    };

    setLocalStorageProjectProgress = (projectName: string, annotation: PolyMetadata[] | undefined) => {
        localStorage.setItem(`${projectName}_bb`, JSON.stringify({ cache: annotation }));
    };

    getLocalStorageProjectProgress = (projectName: string): PolyMetadata | null => {
        const result = localStorage.getItem(`${projectName}_bb`);
        const jsonResult: PolyMetadata | null = result ? JSON.parse(result) : null;
        return jsonResult;
    };
}
