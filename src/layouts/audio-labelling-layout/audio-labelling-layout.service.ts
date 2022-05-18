import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioRegions, DownloadResponse, Message, WaveFormPeaks } from '../../shared/types/message/message.model';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { RegionProps } from '../../shared/types/audio-labelling/audio-labelling.model';

type CustomHistory = Omit<History, 'state'> & {
    state: { projectName: string; fileName: string; filePath: string };
};

@Injectable({
    providedIn: 'any',
})
export class AudioLabellingLayoutService {
    constructor(private http: HttpClient) {}
    private hostPort: string = environment.baseURL;

    getRouteState = (history: CustomHistory) => {
        const { state } = history;
        return { ...state };
    };

    getWaveFormPeaks = (projectName: string): Observable<WaveFormPeaks> => {
        return this.http.get<WaveFormPeaks>(`${this.hostPort}v2/audio/projects/${projectName}/audiopeaks`);
    };

    getRegions = (projectName: string): Observable<AudioRegions> => {
        return this.http.get<AudioRegions>(`${this.hostPort}v2/audio/projects/${projectName}/audioregions`);
    };

    createRegion = (projectName: string, regionProps: RegionProps): Observable<Message> => {
        return this.http.post<Message>(`${this.hostPort}v2/audio/projects/${projectName}/createregion`, {
            regionId: regionProps.regionId,
            labelName: regionProps.labelName,
            startTime: regionProps.startTime,
            endTime: regionProps.endTime,
            loop: regionProps.loop,
            labelColor: regionProps.labelColor,
            draggable: regionProps.draggable,
            isPlaying: regionProps.isPlaying,
            resizable: regionProps.resizable,
        });
    };

    deleteRegion = (projectName: string, regionId: string): Observable<Message> => {
        return this.http.delete<Message>(`${this.hostPort}v2/audio/projects/${projectName}/deleteregion/${regionId}`);
    };

    updateRegion = (projectName: string, regionProps: RegionProps): Observable<Message> => {
        return this.http.put<Message>(`${this.hostPort}v2/audio/projects/${projectName}/updateregion`, {
            regionId: regionProps.regionId,
            labelName: regionProps.labelName,
            startTime: regionProps.startTime,
            endTime: regionProps.endTime,
            loop: regionProps.loop,
            labelColor: regionProps.labelColor,
            draggable: regionProps.draggable,
            isPlaying: regionProps.isPlaying,
            resizable: regionProps.resizable,
        });
    };

    exportAudioAnnotationFile = (projectName: string): Observable<DownloadResponse> => {
        return this.http.post<DownloadResponse>(`${this.hostPort}v2/audio/projects/${projectName}/saveannotation`, {});
    };
}
