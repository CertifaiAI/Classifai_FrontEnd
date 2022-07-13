export type label = {
    labelName: string;
    tagColor: string;
};

export type Features = {
    featureName: string;
    checked: boolean;
};

export type Data = {
    name: string;
    value: string;
};

export type RemovedFeature = Data & {
    index: number;
};

export type annotationsStats = {
    name: string;
    count: number;
};
