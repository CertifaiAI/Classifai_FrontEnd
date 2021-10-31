/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

export type CardFieldConfigs = {
    enabled: boolean;
    urlPath: string;
    hoverLabel?: string;
    title: string;
    imgPath?: string;
    imgAlt?: string;
    logoPath: string;
    logoAlt?: string;
};

export type CardFieldSchema = {
    fields: CardFieldConfigs[];
};

export type CardChoiceImgLblUrlPath = 'boundingbox' | 'segmentation';
export type CardChoiceVideoLblUrlPath = 'videoboundingbox' | 'videosegmentation';

type CardChoiceFieldConfigs = Omit<CardFieldConfigs, 'logoPath' | 'logoAlt'>[] &
    {
        urlPath: CardChoiceImgLblUrlPath;
    }[];

type CardChoiceVideoFieldConfigs = Omit<CardFieldConfigs, 'logoPath' | 'logoAlt'>[] &
    {
        urlPath: CardChoiceVideoLblUrlPath;
    }[];

export type CardChoiceSchema = {
    fields: CardChoiceFieldConfigs;
};

export type CardChoiceVideoSchema = {
    videoFields: CardChoiceVideoFieldConfigs;
};
