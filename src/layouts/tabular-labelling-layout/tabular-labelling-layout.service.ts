import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Message, SpecificTabularDataResponse, UpdateTabularDataResponse } from 'shared/types/message/message.model';
import { Labels } from 'shared/types/dataset-layout/data-set-layout.model';
import { label } from 'shared/types/tabular-labelling/tabular-labelling.model';

type CustomHistory = Omit<History, 'state'> & {
    state: { projectName: string; labellingMode: string };
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

    getAllTabularData(projectName: string): Observable<any> {
        return this.http.get(`${this.hostPort}v2/tabular/projects/${projectName}/alldata`);
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

    setPreLabellingConditions = (projectName: string, conditions: Map<number, any>): Observable<Message> => {
        return this.http.post<Message>(`${this.hostPort}v2/tabular/projects/${projectName}/pre`, {
            condition: conditions,
        });
    };
}
