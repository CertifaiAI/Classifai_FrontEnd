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
    fields: Array<CardFieldConfigs>;
};
