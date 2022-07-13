export type label = {
    name: string;
    color: string;
};

export type RegionProps = {
    regionId: string;
    labelName: string;
    startTime: number;
    endTime: number;
    loop: boolean;
    labelColor: string;
    draggable: boolean;
    isPlaying: boolean;
    resizable: boolean;
};
