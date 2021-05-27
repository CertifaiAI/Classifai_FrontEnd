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

import { Boundingbox } from 'src/components/image-labelling/image-labelling.model';
export class Utils {
    constructor() {}

    public stringifyObject(content: object) {
        try {
            return JSON.stringify(content);
        } catch (err) {
            console.log('StringifyObject(content) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    public deepCloneObject(content: any) {
        try {
            return JSON.parse(JSON.stringify(content));
        } catch (err) {
            console.log('DeepCloneObject(content) ----> ', err.name + ': ', err.message);
            return null;
        }
    }

    public deepCloneVariable(variable: any) {
        try {
            const ret: { item: any } = variable ? JSON.parse(JSON.stringify({ item: variable })) : '';
            const { item } = ret;
            return item;
        } catch (err) {
            console.log('DeepCloneVariable(variable) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    public generateUniquesID(): number {
        try {
            let uniqueIDS = '';
            const now = new Date();
            uniqueIDS += now.getDate().toString();
            uniqueIDS += (now.getMonth() + 1).toString();
            uniqueIDS += now.getFullYear().toString();
            uniqueIDS += now.getHours().toString();
            uniqueIDS += now.getMinutes().toString();
            uniqueIDS += now.getSeconds().toString();
            uniqueIDS += now.getMilliseconds().toString();
            return parseInt(uniqueIDS, 10);
        } catch (err) {
            console.log('GenerateUniquesID() ----> ', err.name + ': ', err.message);
            return -1;
        }
    }

    public matchStringHead(strToMatch: string, oriStr: string): boolean {
        try {
            const extractStr = oriStr.substr(0, strToMatch.length);
            return extractStr === strToMatch ? true : false;
        } catch (err) {
            console.log('MatchStringHead(StrToMatch:string, oristr:string) ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public getFilename(strs: string) {
        try {
            const temStr: string = this.deepCloneVariable(strs);
            const temReplaceStr = temStr.split('\\').join('/');
            const tempArr = temReplaceStr.split('/');
            const tempFileName = tempArr[tempArr.length - 1];

            return tempFileName;
        } catch (err) {
            console.log('GetFilename(strs) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    GetFoldername(strs: string) {
        try {
            const temstr = JSON.parse(JSON.stringify({ st: strs }));
            const temreplacestr = temstr.st.split('\\').join('/');
            const temparr = temreplacestr.split('/');
            temparr.pop();
            const returnstr = temparr.join('/');

            return returnstr;
        } catch (err) {
            console.log('GetFoldername(strs) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    public RemoveHTMLElement(ids: string) {
        try {
            const elem = document.getElementById(ids);
            if (elem !== null && elem !== undefined) {
                elem.parentNode?.removeChild(elem);
            }
        } catch (err) {
            console.log('RemoveHTMLElement(ids) ----> ', err.name + ': ', err.message);
        }
    }
}

export class ImglblCopyPaste {
    private memo!: Boundingbox | undefined;
    private utility!: Utils;
    constructor() {
        try {
            this.utility = new Utils();
        } catch (err) {
            console.log('ImglblCopyPaste  constructor() ----> ', err.name + ': ', err.message);
        }
    }

    public copy(boundData: Boundingbox) {
        try {
            if (boundData != undefined) {
                this.memo = this.utility.deepCloneObject(boundData);
            }
        } catch (err) {
            console.log('ImglblCopyPaste  copy() ----> ', err.name + ': ', err.message);
        }
    }

    public paste(): Boundingbox | undefined {
        try {
            if (this.memo) {
                const rtMEMO: Boundingbox = this.utility.deepCloneObject(this.memo);
                this.memo = undefined;
                const tempW = rtMEMO.x2 - rtMEMO.x1;
                const tempH = rtMEMO.y2 - rtMEMO.y1;
                rtMEMO.x1 += 8;
                rtMEMO.y1 += 8;
                rtMEMO.x2 = rtMEMO.x1 + tempW;
                rtMEMO.y2 = rtMEMO.y1 + tempH;
                const tempuuid: number = this.utility.generateUniquesID();
                rtMEMO.id = tempuuid;
                rtMEMO.distancetoImg.x = 0;
                rtMEMO.distancetoImg.y = 0;
                return rtMEMO;
            }
            return undefined;
        } catch (err) {
            console.log('ImglblCopyPaste  paste() ----> ', err.name + ': ', err.message);
            return undefined;
        }
    }

    public isAvailable(): boolean {
        try {
            return this.memo ? true : false;
        } catch (err) {
            console.log('ImglblCopyPaste  isAvailable() ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public clearMemo() {
        try {
            if (this.memo !== undefined) {
                this.memo = undefined;
            }
        } catch (err) {
            console.log('ImglblCopyPaste  clearMemo() ----> ', err.name + ': ', err.message);
        }
    }
}
