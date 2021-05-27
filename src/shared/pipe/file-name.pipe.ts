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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileNameSlice' })
export class FileNamePipe implements PipeTransform {
    /**
     * @function responsible to transform the given image path to a proper filename
     * @param {string} name - props of image path
     * @return filename with extension
     */
    transform(name: string): string {
        const newName = name
            ? // if browser detected OS that starts with Mac just trim in OS's path
              window.navigator.platform.startsWith('Mac')
                ? name.split('/').slice(-1)[0]
                : name.split('\\').slice(-1)[0]
            : '';
        return newName;
    }
}
