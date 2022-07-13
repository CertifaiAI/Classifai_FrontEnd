/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { CardFieldSchema, ChosenType } from 'shared/types/home-layout/home-layout.model';
import { Component, EventEmitter, Output } from '@angular/core';

import { LabelModeService } from 'shared/services/label-mode-service';
import { Router } from '@angular/router';

@Component({
    selector: 'home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss'],
})
export class HomeContentComponent {
    @Output() _navigate: EventEmitter<ChosenType> = new EventEmitter();
    languageArr: (string | RegExpMatchArray)[] = [];
    jsonSchema: CardFieldSchema;

    constructor(private router: Router, private labelModeService: LabelModeService) {
        this.jsonSchema = {
            fields: [
                {
                    enabled: true,
                    urlPath: '/dataset',
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
                    enabled: true,
                    urlPath: '/dataset',
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
                    imgAlt: 'voice',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_MP3.png',
                    logoAlt: 'voice',
                },
            ],
        };
    }

    onThumbnailClick(chosenType: ChosenType): void {
        if (chosenType.title === 'tabular' || chosenType.title === 'audio') {
            this.labelModeService.setLabelMode(chosenType.title);
            this.router.navigate([chosenType.url]);
        } else {
            this._navigate.emit(chosenType);
        }
    }
}
