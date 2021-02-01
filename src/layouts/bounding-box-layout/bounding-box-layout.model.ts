export type AddedBBoxSubLabel = {
    label: string;
    region: string;
};

export type EventEmitter_BBoxAction = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
};
