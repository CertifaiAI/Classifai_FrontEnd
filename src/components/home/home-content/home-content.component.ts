/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CardFieldSchema } from '../../../layouts/home-layout/home-layout.model';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss'],
})
export class HomeContentComponent implements OnInit {
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
                    imgPath: '../../assets/landing-page/Classifai_Thumbnail_Tabular.jpg',
                    imgAlt: 'tabular',
                    logoPath: '../../assets/landing-page/ClassifaiThumbnail_Icon_CSV.png',
                    logoAlt: 'CSV',
                },
                {
                    enabled: true,
                    urlPath: '/dataset',
                    title: 'image',
                    imgPath: '../../assets/landing-page/Classifai_Thumbnail_Image.jpg',
                    imgAlt: 'image',
                    logoPath: '../../assets/landing-page/ClassifaiThumbnail_Icon_JPEG.png',
                    logoAlt: 'image',
                },
                {
                    enabled: false,
                    urlPath: '',
                    hoverLabel: 'comingSoon',
                    title: 'video',
                    imgPath: '../../assets/landing-page/Classifai_Thumbnail_Video.jpg',
                    imgAlt: 'video',
                    logoPath: '../../assets/landing-page/ClassifaiThumbnail_Icon_MP4.png',
                    logoAlt: 'Video',
                },
                {
                    enabled: false,
                    urlPath: '',
                    hoverLabel: 'comingSoon',
                    title: 'voice',
                    imgPath: '../../assets/landing-page/Classifai_Thumbnail_Voice.jpg',
                    imgAlt: 'voice',
                    logoPath: '../../assets/landing-page/ClassifaiThumbnail_Icon_MP3.png',
                    logoAlt: 'voice',
                },
            ],
        };
    }

    ngOnInit(): void {}

    onThumbnailClick(url: string): void {
        this._navigate.emit(url);
    }
}
