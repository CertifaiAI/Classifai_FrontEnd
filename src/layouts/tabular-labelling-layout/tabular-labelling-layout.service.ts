import {
    DownloadResponse,
    Message,
    SpecificTabularDataResponse,
    UpdateTabularDataResponse,
} from 'shared/types/message/message.model';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Labels } from 'shared/types/dataset-layout/data-set-layout.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { label } from 'shared/types/tabular-labelling/tabular-labelling.model';

type CustomHistory = Omit<History, 'state'> & {
    state: { projectName: string; labellingMode: string; projectFolder: string };
};

@Injectable({
    providedIn: 'any',
})
export class TabularLabellingLayoutService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

    getRouteState(history: CustomHistory) {
        const { state } = history;
        return { ...state };
    }

    getAllTabularData(projectName: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.hostPort}v2/tabular/projects/${projectName}/alldata`);
    }

    updateTabularDataLabel = (
        projectName: string,
        UUID: string,
        annotation: label[] | null,
    ): Observable<UpdateTabularDataResponse> => {
        return this.http.put<UpdateTabularDataResponse>(
            `${this.hostPort}v2/tabular/projects/${projectName}/updatedata`,
            {
                uuid: UUID,
                tabular_label: JSON.stringify(annotation),
            },
        );
    };

    getSpecificData = (projectName: string, uuid: string): Observable<SpecificTabularDataResponse> => {
        return this.http.get<SpecificTabularDataResponse>(
            `${this.hostPort}v2/tabular/projects/${projectName}/uuid/${uuid}/data`,
        );
    };

    setPreLabellingConditions = (
        projectName: string,
        conditions: Map<number, any>,
        uuid: string,
        mode: string,
    ): Observable<Message> => {
        let list = [];
        for (const [key, value] of conditions) {
            list.push([key, value]);
        }
        const conditionsJsonObject = Object.fromEntries(list);

        return this.http.post<Message>(`${this.hostPort}v2/tabular/projects/${projectName}/prelabel`, {
            conditions: JSON.stringify(conditionsJsonObject),
            uuid: uuid,
            labelling_mode: mode,
        });
    };

    downloadFile = (projectName: string, format: string, filterInvalidData: boolean): Observable<DownloadResponse> => {
        return this.http.post<DownloadResponse>(`${this.hostPort}v2/tabular/projects/${projectName}/file`, {
            file_type: format,
            filter_invalid_data: filterInvalidData,
        });
    };

    getAllInvalidData(projectName: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.hostPort}v2/tabular/projects/${projectName}/invalid`);
    }
}
