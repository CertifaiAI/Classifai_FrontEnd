type errormessage = string;
type content = string[];
type message = boolean | number;
type progress = any;
type labellist = string[];
type uuid_list = number;
type img_src = string;

export interface IContent {
    content: content;
    message: message;
    errormessage: errormessage;
}

export interface IMessage {
    message: message;
}

export interface IMessageUuidList {
    message: message;
    uuid_list: uuid_list[];
}

export interface IBase64Img {
    message: message;
    img_src: img_src;

    errorcode: number;
    errormessage: string;
}

export interface ILabelList {
    labellist: labellist;
    message: message;
    progress: progress;
    uuid_list: uuid_list[];
}

export interface IThumbnailMetadata {
    img_path: string;
    project_name: string;
    uuid: number;
    img_x: number;
    img_y: number;
    img_w: number;
    img_h: number;
    img_oriW: number;
    img_oriH: number;
    img_thumbnail: string;
    img_depth: number;
}

export interface IProjectStatus {
    status: string;
    backgroundColour: number;
    title: string;
    createdDate: string;
}

export type projectSchema = {
    fields: Array<IProjectStatus>;
};
