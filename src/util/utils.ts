/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Boundingbox } from 'shared/types/image-labelling/image-labelling.model';
import papaparse from 'papaparse';
import { Observable } from 'rxjs';

export class Utils {
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

            return tempArr[tempArr.length - 1];
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

            return temparr.join('/');
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

    public parseCsvToJson(event: any) {
        papaparse.parse(event.target.files[0], {
            complete(results: { data: any }) {
                console.log('Finished:', results.data);
            },
        });
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
            if (boundData !== undefined) {
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
