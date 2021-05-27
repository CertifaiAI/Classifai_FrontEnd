/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type error_code = number;
type errormessage = string;
type content = string[];
type message = boolean | number;
export type uuid = string;
type img_src = string;
type uuid_add_list = string[];
type uuid_delete_list = string[];
type project_config_path = string;

export type MessageContent<TContent = undefined> = {
    content: TContent extends undefined ? content : TContent;
    message: message;
    errormessage: errormessage;
};

export type Message = {
    message: message;
};

export type ExportResponse = {
    message: message;
    project_config_path: project_config_path;
};

export type ImportResponse = {
    message: error_code;
    error_message: errormessage;
};

export type MessageUuidList = {
    message: message;
    uuid_list: uuid[];
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
    uuid_add_list: uuid_add_list;
    uuid_delete_list: uuid_delete_list;
};
