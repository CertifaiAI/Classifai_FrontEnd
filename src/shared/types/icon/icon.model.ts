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

/** @interface icons' object mapping */
type IconConfigs = {
    imgPath: string;
    hoverLabel: string;
    alt: string;
    nonClickable?: boolean;
    style?: string;
    // inputType?: string;
    // accept?: 'image/x-png,image/jpeg';
    toggleable?: boolean;
    /** @function responsible for toggling function */
    onClick: (arg: any) => void;
    /** @function responsible for uploading thumbnail(s) */
    // onUpload?();
};

/** @interface backbone of icons' object schema */
export type IconSchema = {
    [key: string]: Array<IconConfigs>;
};
