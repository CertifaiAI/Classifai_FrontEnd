/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { UUID } from 'shared/types/message/message.model';
import { WithOptional } from 'shared/types/with-optional/with-optional';

export type VideoLabelUrl = '/videolabel/videobndbox' | '/videolabel/videoseg' | '';

export type VideoLabelProps = {
    status?: boolean;
    currentThumbnailIndex: number;
    totalNumThumbnail: number;
    thumbnailName: string | undefined;
    hasAnnotation: boolean;
};

export type VideoProps = Omit<BboxMetadata, 'bnd_box'> & {
    img_src: string;
};

export type UrlProps = {
    url: string;
};

export type ThumbnailInfoProps = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
} & Partial<UrlProps>;

export type EventEmitter_Url = UrlProps;

export type EventEmitter_ThumbnailDetails = CompleteMetadata & {
    thumbnailIndex: number;
};

export type ActionState = {
    scroll: boolean;
    drag: boolean;
    draw: boolean;
    fitCenter: boolean;
    clear: boolean;
    isActiveModal: boolean;
    save: boolean;
    keyInfo: boolean;
    crossLine: boolean;
    // dbClick: boolean;
};

export type VideoLabellingMode = 'videobndbox' | 'videoseg' | null;

export type TabsProps<TMetadata = undefined> = {
    name: string;
    closed: boolean;
    label_list?: string[];
    annotation?: TMetadata extends undefined ? BboxMetadata[] | PolyMetadata[] : TMetadata[];
};

type TabAction = {
    /** @property {number} 1 represents add, whereas 0 represent remove */
    action: 1 | 0;
};

export type ActionTabProps = {
    tabType: string;
} & TabAction;

export type SelectedLabelProps = {
    selectedLabel: string;
    label_list: string[];
} & TabAction;

export type ChangeAnnotationLabel = {
    label: string;
    index: number;
};

export type AddSubLabel = {
    label: string;
    region: string;
};

export type EventEmitter_Action = {
    /** @property {number} 1 represents next photo, whereas -1 represent previous photo */
    thumbnailAction?: 1 | -1;
};

type IAxis = {
    x: number;
    y: number;
};

export type SubLabel = {
    region: string;
    label: string;
};

export type Coordinate = {
    x: number;
    y: number;
    distancetoImg: {
        x: number;
        y: number;
    };
};

export type Boundingbox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth: number;
    color: string;
    distancetoImg: IAxis;
    label: string;
    id: number;
    subLabel?: SubLabel[];
    region?: string;
};

export type Polygons = {
    coorPt: Coordinate[];
    label: string;
    id: number;
    lineWidth: number;
    color: string;
    region: string;
    subLabel: SubLabel[];
};

type Metadata = {
    img_h: number;
    img_ori_h: number;
    img_ori_w: number;
    img_path: string;
    img_thumbnail: string;
    img_w: number;
    img_x: number;
    img_y: number;
    project_name: string;
    uuid: UUID;
    video_time_stamp: number;
    video_frame_index: number;
    video_file_path: string;
};

export type BboxMetadata = Metadata & {
    bnd_box: Boundingbox[];
    img_depth: number;
};

export type PolyMetadata = Metadata & {
    polygons: Polygons[];
    file_size: number;
};

export type CompleteMetadata = WithOptional<BboxMetadata, 'bnd_box' | 'img_depth'> &
    WithOptional<PolyMetadata, 'polygons'>;

export type Method = 'zoom' | 'draw' | 'pan';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type UndoState = { meta: BboxMetadata | PolyMetadata | null; method: Method } | null;

export type Globalloc = { scale: number; offset: { x: number; y: number } };
export type Panloc = {
    start: { x: number; y: number };
    offset: { x: number; y: number };
};
export type ProgressTuple = { url: string; data: Metadata };
export type Stages = { stage: Metadata; method: string };
export type xyCoordinate = { x: number; y: number };

export type FitScreenCalc = {
    factor: number;
    newX: number;
    newY: number;
};

export type LabelInfo = {
    name: string;
    count: number;
};

export type LabelChoosen = {
    label: string;
    isChoosen: boolean;
};

export type DiffXY = { diffX: number; diffY: number };

export type LabelledFrame = {
    frame: number[];
    // object: string;
    isShow: boolean;
    color: string;
};

export type FrameArray = {
    frameURL: string;
};

export type VideoDuration = {
    hour: number;
    minute: number;
    second: number;
};

export type projectNameUUIDList = {
    projectName: string;
    uuidList: string[];
};

export type videoFramesExtractionState = {
    extractedFrameIndex: number;
    isVideoFramesExtractionCompleted: boolean;
    videoPath: string;
    framesPerSecond: number;
    videoDuration: string;
};
