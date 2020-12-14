import { BoundingBox } from '../meta-data/meta-data.model';

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
            let temstr = JSON.parse(JSON.stringify({ st: strs }));
            let temreplacestr = temstr.st.split('\\').join('/');
            let temparr = temreplacestr.split('/');
            temparr.pop();
            let returnstr = temparr.join('/');

            return returnstr;
        } catch (err) {
            console.log('GetFoldername(strs) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class ImglblCopyPaste {
    private memo!: BoundingBox | undefined;
    private utility!: Utils;
    constructor() {
        try {
            this.utility = new Utils();
        } catch (err) {
            console.log('ImglblCopyPaste  constructor() ----> ', err.name + ': ', err.message);
        }
    }

    public copy(boundData: BoundingBox) {
        try {
            if (boundData != undefined) {
                this.memo = this.utility.deepCloneObject(boundData);
            }
        } catch (err) {
            console.log('ImglblCopyPaste  copy() ----> ', err.name + ': ', err.message);
        }
    }

    public paste(): BoundingBox | undefined {
        try {
            if (this.memo) {
                const rtMEMO: BoundingBox = this.utility.deepCloneObject(this.memo);
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
