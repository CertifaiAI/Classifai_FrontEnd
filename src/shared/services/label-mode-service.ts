import { BehaviorSubject, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LabelModeService {
    private labelModeUrlMap: Map<string, string> = new Map([
        ['imgbndbox', 'imglabel/bndbox'],
        ['imgseg', 'imglabel/seg'],
        ['videobndbox', 'videolabel/bndbox'],
        ['videoseg', 'videolabel/seg'],
        ['tabular', 'tabular'],
        ['audio', 'audio'],
    ]);

    private annotationType: Map<string, string> = new Map([
        ['imgbndbox', 'imageboundingbox'],
        ['imgseg', 'imagesegmentation'],
        ['videobndbox', 'videoboundingbox'],
        ['videoseg', 'videosegmentation'],
        ['tabular', 'tabular'],
        ['audio', 'audio'],
    ]);

    private navigateUrl: string = '';
    private labellingModeSubject = new BehaviorSubject<string | null>(null);
    public labelMode$ = this.labellingModeSubject.asObservable();

    setLabelMode(annotationMode: string) {
        this.setLabellingMode(annotationMode);
        this.navigateUrl = this.labelModeUrlMap.get(annotationMode) as string;
    }

    retrieveUrlBasedOnAnnotationMode() {
        return this.navigateUrl;
    }

    public setLabellingMode = (labellingMode: string | null) => {
        labellingMode ? this.labellingModeSubject.next(labellingMode) : this.labellingModeSubject.next(null);
    };

    public getAnnotationType = (labelMode: string | null) => {
        let annotationType: string = '';
        if (labelMode == null) {
            throw new Error('Invalid');
        } else {
            annotationType = this.annotationType.get(labelMode) as string;
        }
        return annotationType;
    };
}
