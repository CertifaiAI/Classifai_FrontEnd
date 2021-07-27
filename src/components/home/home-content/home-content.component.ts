/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { CardFieldSchema } from 'shared/types/home-layout/home-layout.model';

@Component({
    selector: 'home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss'],
})
export class HomeContentComponent {
    @Output() _navigate: EventEmitter<string> = new EventEmitter();
    languageArr: (string | RegExpMatchArray)[] = [];
    jsonSchema: CardFieldSchema;

    constructor() {
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
                    enabled: true,
                    urlPath: '/videolbl/bndbox',
                    title: 'video',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Video.jpg',
                    imgAlt: 'video',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_MP4.png',
                    logoAlt: 'Video',
                },
                {
                    enabled: false,
                    urlPath: '',
                    hoverLabel: 'comingSoon',
                    title: 'voice',
                    imgPath: 'assets/landing-page/Classifai_Thumbnail_Voice.jpg',
                    imgAlt: 'voice',
                    logoPath: 'assets/landing-page/ClassifaiThumbnail_Icon_MP3.png',
                    logoAlt: 'voice',
                },
            ],
        };
    }

    onThumbnailClick(url: string): void {
        this._navigate.emit(url);
    }
}
