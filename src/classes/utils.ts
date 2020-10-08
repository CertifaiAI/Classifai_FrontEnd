import { BoundingBox } from './CustomType';

export class utils {
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
            if (variable != undefined || variable != null) {
                var ret = JSON.parse(JSON.stringify({ item: variable }));
                return ret.item;
            }
            return '';
        } catch (err) {
            console.log('DeepCloneVariable(variable) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    public generateUniquesID(): number {
        try {
            let UniqueIDS = '';
            let now = new Date();
            UniqueIDS += now.getDate().toString();
            UniqueIDS += (now.getMonth() + 1).toString();
            UniqueIDS += now.getFullYear().toString();
            UniqueIDS += now.getHours().toString();
            UniqueIDS += now.getMinutes().toString();
            UniqueIDS += now.getSeconds().toString();
            UniqueIDS += now.getMilliseconds().toString();
            return parseInt(UniqueIDS, 10);
        } catch (err) {
            console.log('GenerateUniquesID() ----> ', err.name + ': ', err.message);
            return -1;
        }
    }

    public matchStringHead(strToMatch: string, oristr: string): boolean {
        try {
            let extractStr = oristr.substr(0, strToMatch.length);
            if (extractStr === strToMatch) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('MatchStringHead(StrToMatch:string, oristr:string) ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public getFilename(strs: string) {
        try {
            let temstr: string = this.deepCloneVariable(strs);
            let temreplacestr = temstr.split('\\').join('/');
            let temparr = temreplacestr.split('/');
            let tempfilename = temparr[temparr.length - 1];

            return tempfilename;
        } catch (err) {
            console.log('GetFilename(strs) ----> ', err.name + ': ', err.message);
            return '';
        }
    }
}

export class imglblCopyPaste {
    private memo!: BoundingBox | undefined;
    private utility!: utils;
    constructor() {
        try {
            this.utility = new utils();
        } catch (err) {
            console.log('imglblCopyPaste  constructor() ----> ', err.name + ': ', err.message);
        }
    }

    public copy(boundData: BoundingBox) {
        try {
            if (boundData != undefined) {
                this.memo = this.utility.deepCloneObject(boundData);
            }
        } catch (err) {
            console.log('imglblCopyPaste  copy() ----> ', err.name + ': ', err.message);
        }
    }

    public paste(): BoundingBox | undefined {
        try {
            if (this.memo != undefined) {
                let rtMEMO: BoundingBox = this.utility.deepCloneObject(this.memo);
                this.memo = undefined;
                let tempW = rtMEMO.x2 - rtMEMO.x1;
                let tempH = rtMEMO.y2 - rtMEMO.y1;
                rtMEMO.x1 += 8;
                rtMEMO.y1 += 8;
                rtMEMO.x2 = rtMEMO.x1 + tempW;
                rtMEMO.y2 = rtMEMO.y1 + tempH;
                let tempuuid: number = this.utility.generateUniquesID();
                rtMEMO.id = tempuuid;
                rtMEMO.distancetoImg.x = 0;
                rtMEMO.distancetoImg.y = 0;
                return rtMEMO;
            }
            return undefined;
        } catch (err) {
            console.log('imglblCopyPaste  paste() ----> ', err.name + ': ', err.message);
            return undefined;
        }
    }

    public isAvailable(): boolean {
        try {
            if (this.memo !== undefined) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('imglblCopyPaste  isAvailable() ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public clearMemo() {
        try {
            if (this.memo !== undefined) {
                this.memo = undefined;
            }
        } catch (err) {
            console.log('imglblCopyPaste  clearMemo() ----> ', err.name + ': ', err.message);
        }
    }
}
