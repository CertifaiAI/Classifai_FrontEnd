/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { CardFieldSchema, ChosenType } from 'shared/types/home-layout/home-layout.model';
import { Router } from '@angular/router';
import { LabellingModeService } from '../../../shared/services/labelling-mode-service';

@Component({
    selector: 'home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss'],
})
export class HomeContentComponent {
    @Output() _navigate: EventEmitter<string> = new EventEmitter();
    languageArr: (string | RegExpMatchArray)[] = [];
    jsonSchema: CardFieldSchema;

    constructor(private _router: Router, private _labellingModeService: LabellingModeService) {
        this.jsonSchema = {
            fields: [
                {
                    enabled: false,
                    urlPath: '',
                    hoverLabel: 'comingSoon',
                    title: 'tabular',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Tabular.jpg',
                    imgAlt: 'tabular',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_CSV.png',
                    logoAlt: 'CSV',
                },
                {
                    enabled: true,
                    urlPath: '/dataset',
                    title: 'image',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Image.jpg',
                    imgAlt: 'image',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_JPEG.png',
                    logoAlt: 'image',
                },
                {
                    enabled: false,
                    urlPath: '',
                    hoverLabel: 'comingSoon',
                    title: 'video',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Video.jpg',
                    imgAlt: 'video',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_MP4.png',
                    logoAlt: 'Video',
                },
                {
                    enabled: true,
                    urlPath: '/dataset',
                    title: 'audio',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Voice.jpg',
                    imgAlt: 'audio',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_MP3.png',
                    logoAlt: 'audio',
                },
            ],
        };
    }

    onThumbnailClick(chosenType: ChosenType): void {
        if (chosenType.title === 'audio') {
            this._labellingModeService.setLabelMode(chosenType.title);
            this._router.navigate([chosenType.url]);
        } else {
            this._navigate.emit(chosenType.url);
        }
    }
}
