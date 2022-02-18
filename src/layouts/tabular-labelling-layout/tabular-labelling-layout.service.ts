import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';

type CustomHistory = Omit<History, 'state'> & {
    state: { projectName: string };
};

@Injectable({
    providedIn: 'root',
})
export class TabularLabellingLayoutService {
    private hostPort: string = environment.baseURL;

    constructor(private http: HttpClient) {}

    getRouteState(history: CustomHistory) {
        const { state } = history;
        return { ...state };
    }

    getTabularData(projectName: string): Observable<any> {
        return this.http.get(`${this.hostPort}tabular/projects/${projectName}/tabulardata`);
    }
}
