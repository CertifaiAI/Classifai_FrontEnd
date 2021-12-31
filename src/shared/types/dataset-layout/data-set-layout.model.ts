/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { UUID } from 'shared/types/message/message.model';

type message = boolean | number;
type progress = any;
type label_list = string[];
type window_status = boolean | number;
type path = string;

export type LabelList = {
    label_list: label_list;
    message: message;
    progress: progress;
    uuid_list: UUID[];
};

export type Folder = {
    message: message;
    window_status: window_status;
    window_message: string;
    project_path: path;
};

export type Labels = {
    message: message;
    window_status: window_status;
    window_message: string;
    label_file_path: path;
};

export type ProjectStatus = {
    status: string;
    backgroundColour: number;
    title: string;
    createdDate: string;
};

export type Project = {
    project_name: string;
    project_path: string;
    is_loaded: boolean;
    is_starred: boolean;
    is_new: boolean;
    total_uuid: number;
    created_date: string;
    last_modified_date: string;
    created_timestamp: Date;
    last_modified_timestamp: Date;
    root_path_valid: boolean;
};

export type VideoProject = Project & {
    video_length: number;
    video_file_path: string;
    is_video_frames_extraction_completed: boolean;
    extracted_frame_index: number;
};

export type ChartProps = {
    name: string;
    value: number;
};

export type ProjectSchema = {
    projects: Project[];
    isUploading: boolean;
    isFetching: boolean;
};

/** @type mainly used for passing props with generic type while ability to allow conditional of generic type usage */
export type DataSetProps<T = undefined> =
    | {}
    | (T extends undefined
          ? {
                // theme: string;
                status?: boolean;
                currentThumbnailIndex: number;
                totalNumThumbnail: number;
                thumbnailName: string | undefined;
            }
          : T);

export type FileType = 'file' | 'folder';

export type UploadThumbnailProps = {
    projectName: string;
    fileType: FileType;
};

export type StarredProps = {
    projectName: string;
    starred: boolean;
};

export type ProjectRename = {
    shown: boolean;
    projectName: string;
};

export type Videos = {
    message: message;
    window_status: window_status;
    window_message: string;
    video_file_path: path;
    extraction_partition: number;
};

export type VideoFramesExtractionStatus = {
    message: message;
    video_frames_extraction_status: number;
    video_frames_extraction_message: string;
    current_time_stamp: number;
    is_video_frames_extraction_completed: boolean;
    extracted_frame_index: number;
};
