/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment.prod';
import { FrameExtractionResponse, FrameResponse } from './video-labelling.modal';

@Injectable({ providedIn: 'any' })
export class VideoLabellingApiService {
    // private hostPort: string = environment.baseURL;
    private hostPort: string = 'localhost:4200/';

    constructor(private http: HttpClient, private router: Router) {}

    getSingleFrameSrc = (frameIdx: number): Observable<FrameResponse> => {
        return this.http.get<FrameResponse>(`${this.hostPort}video/frame/${frameIdx}`);
    };

    frameExtraction = (vidPath: string): Observable<FrameExtractionResponse> => {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            body: {
                videoPath: vidPath,
                saveFrameToFolder: true,
            },
        };
        return this.http.post<FrameExtractionResponse>(`${this.hostPort}video/init`, options);
    };
}
