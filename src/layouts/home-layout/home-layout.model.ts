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

type CardChoiceFieldConfigs = Omit<CardFieldConfigs, 'logoPath' | 'logoAlt'>[] &
    {
        urlPath: CardChoiceImgLblUrlPath;
    }[];

export type CardChoiceSchema = {
    fields: CardChoiceFieldConfigs;
};
