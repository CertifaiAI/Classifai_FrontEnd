/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { RegionProps } from '../labelling-type/audio-labelling.model';

type error_code = number;
type errormessage = string;
type content = string[];
type message = boolean | number;
type img_src = string;
type uuid_add_list = string[];
type uuid_delete_list = string[];
type uuid_list = string[];
type project_config_path = string;
type window_status = boolean | number;
type path = string;

export type UUID = string;

export type labels_stats = {
    label: string;
    count: number;
};

export type project_stats = {
    project_name: string;
    labeled_image: number;
    unlabeled_image: number;
    label_per_class_in_project: labels_stats[];
};

export type MessageContent<TContent = undefined> = {
    content: TContent extends undefined ? content : TContent;
    message: message;
    errormessage: errormessage;
};

export type Message = {
    message: message;
};

export type ProjectMessage = {
    message: message;
    error_code: error_code;
    error_message: errormessage;
};

export type ExportResponse = {
    message: message;
    error_code: error_code;
    error_message: errormessage;
};

export type ExportStatus = {
    message: message;
    export_status: error_code;
    export_status_message: errormessage;
    project_config_path: project_config_path;
};

export type ImportResponse = {
    message: error_code;
    file_system_status: number;
    file_system_message: string;
    project_name?: string;
};

export type ProjectStatsResponse = {
    message: error_code;
    project_name: string;
    labeled_data: number;
    unlabeled_data: number;
    label_per_class_in_project: labels_stats[];
    error_message?: string;
};

export type MessageUploadStatus = {
    message: message;
    file_system_status: number;
    file_system_message: string;
    unsupported_image_list: string[];
};

export type MessageBase64Img = {
    message: message;
    img_src: img_src;
    errorcode: error_code;
    errormessage: string;
};

export type MessageProjectProgress = {
    error_code?: error_code;
    error_message?: errormessage;
    message: message;
};

export type MessageReload = {
    message: message;
    file_system_status: number;
    file_system_message: string;
    uuid_add_list: uuid_add_list;
    uuid_delete_list: uuid_delete_list;
    unsupported_image_list: string[];
};

export type MessageRenameImg = {
    message: message;
    error_code: error_code;
    img_path: img_src;
};

export type MessageDeleteImg = {
    message: message;
    uuid_list: uuid_list;
};

export type AddImageResponse = {
    add_image_status: number;
    add_image_message: string;
};

export type Audio = {
    message: message;
    window_status: window_status;
    window_message: string;
    audio_file_path: path;
};

export type WaveFormPeaks = {
    message: message;
    error_message: string;
    wave_form_peaks: number[];
};

export type AudioRegions = {
    message: string;
    audio_regions: RegionProps[];
};

export type DownloadResponse = {
    message: message;
    error_code?: error_code;
    error_message?: errormessage;
};

export type UpdateTabularDataResponse = {
    message: number;
    error_code?: error_code;
    error_message?: errormessage;
};

export type SpecificTabularDataResponse = {
    message: number;
    error_message?: errormessage;
    tabular_data: any;
};

export type AllTabularDataResponse = {
    message: number;
    error_message?: errormessage;
    error_code?: error_code;
    content: string[];
};
