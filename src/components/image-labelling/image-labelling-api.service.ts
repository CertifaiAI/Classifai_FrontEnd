import { BboxMetadata, ImageLabellingMode, PolyMetadata } from 'src/components/image-labelling/image-labelling.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { ImageLabellingModeService } from './image-labelling-mode.service';
import { Injectable } from '@angular/core';
import { Message, MessageBase64Img, MessageProjectProgress, uuid } from 'src/shared/types/message/message.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'any' })
export class ImageLabellingApiService {
    private hostPort: string = environment.baseURL;
    private imageLabellingMode: ImageLabellingMode = null;

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
        // console.log(label_list);
        const checkLabelList: string[] = label_list.length > 0 ? label_list : ['default'];
        return this.http.put<Message>(`${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/newlabels`, {
            label_list: checkLabelList,
        });
    };

    updateProjectProgress = <T extends BboxMetadata | PolyMetadata>(
        projectName: string,
        uuid: uuid,
        metadata: T,
    ): Observable<MessageProjectProgress> => {
        return this.http.put<MessageProjectProgress>(
            `${this.hostPort}${this.imageLabellingMode}/projects/${projectName}/uuid/${uuid}/update`,
            {
                ...metadata,
            },
        );
    };

    checkIfBboxMetaType(
        metadata: BboxMetadata | PolyMetadata | BboxMetadata[] | PolyMetadata[],
    ): metadata is BboxMetadata | BboxMetadata[] {
        if (Array.isArray(metadata)) {
            return (metadata as BboxMetadata[])[0].bnd_box !== undefined;
        } else {
            return (metadata as BboxMetadata).bnd_box !== undefined;
        }
    }

    setLocalStorageProjectProgress = <T extends BboxMetadata[] | PolyMetadata[]>(
        projectName: string,
        annotation: T,
    ) => {
        // this.checkIfBboxMetaType(annotation)
        //     ? localStorage.setItem(`${projectName}_bndbox`, JSON.stringify({ cache: annotation }))
        //     : localStorage.setItem(`${projectName}_seg`, JSON.stringify({ cache: annotation }));

        localStorage.setItem(`${projectName}_${this.imageLabellingMode}`, JSON.stringify({ cache: annotation }));
    };

    getLocalStorageProjectProgress = <T extends BboxMetadata | PolyMetadata>(projectName: string) => {
        const result = localStorage.getItem(`${projectName}_${this.imageLabellingMode}`);
        const jsonResult: T | null = result ? JSON.parse(result) : null;
        return jsonResult;
    };
}
