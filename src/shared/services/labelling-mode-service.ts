import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LabellingModeService {
    private labelModeUrlMap: Map<string, string> = new Map([
        ['bndbox', 'imglabel/bndbox'],
        ['seg', 'imglabel/seg'],
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
}
