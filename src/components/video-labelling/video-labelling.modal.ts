/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { uuid } from 'src/shared/types/message/message.model';
import { WithOptional } from 'src/shared/types/with-optional/with-optional';

export type LabelledFrame = {
    frame: number[];
    object: string;
    isShow: boolean;
    color: string;
};

export type FrameArray = {
    frameURL: string;
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
    uuid: uuid;
};

export type BboxMetadata = Metadata & {
    bnd_box: Boundingbox[];
    img_depth: number;
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

type IAxis = {
    x: number;
    y: number;
};

type SubLabel = {
    region: string;
    label: string;
};

export type ActionState = {
    scroll: boolean;
    drag: boolean;
    draw: boolean;
    fitCenter: boolean;
    clear: boolean;
    isActiveModal: boolean;
    save: boolean;
    // dbClick: boolean;
};

export type DiffXY = { diffX: number; diffY: number };

export type Direction = 'up' | 'down' | 'left' | 'right';

export type xyCoordinate = { x: number; y: number };

export type LabelInfo = {
    name: string;
    count: number;
};
