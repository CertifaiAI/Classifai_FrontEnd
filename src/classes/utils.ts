import { Boundingbox } from './CustomType';

export class utils {
    constructor() {}

    public StringifyObject(content: object) {
        try {
            return JSON.stringify(content);
        } catch (err) {
            console.log('StringifyObject(content) ----> ', err.name + ': ', err.message);
            return '';
        }
    }

    public DeepCloneObject(content) {
        try {
            return JSON.parse(JSON.stringify(content));
        } catch (err) {
            console.log('DeepCloneObject(content) ----> ', err.name + ': ', err.message);
            return null;
        }
    }

    public DeepCloneVariable(variable) {
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

    public GenerateUniquesID(): number {
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
            return null;
        }
    }

    public MatchStringHead(StrToMatch: string, oristr: string): boolean {
        try {
            let extractStr = oristr.substr(0, StrToMatch.length);
            if (extractStr === StrToMatch) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('MatchStringHead(StrToMatch:string, oristr:string) ----> ', err.name + ': ', err.message);
            return false;
        }
    }

    public GetFilename(strs: string) {
        try {
            let temstr: string = this.DeepCloneVariable(strs);
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
    private MEMO: Boundingbox;
    private utility: utils;
    constructor() {
        try {
            this.utility = new utils();
        } catch (err) {
            console.log('imglblCopyPaste  constructor() ----> ', err.name + ': ', err.message);
        }
    }

    public copy(BoundData: Boundingbox) {
        try {
            if (BoundData != undefined) {
                this.MEMO = this.utility.DeepCloneObject(BoundData);
            }
        } catch (err) {
            console.log('imglblCopyPaste  copy() ----> ', err.name + ': ', err.message);
        }
    }

    public paste(): Boundingbox {
        try {
            if (this.MEMO != undefined) {
                let rtMEMO: Boundingbox = this.utility.DeepCloneObject(this.MEMO);
                this.MEMO = undefined;
                let tempW = rtMEMO.x2 - rtMEMO.x1;
                let tempH = rtMEMO.y2 - rtMEMO.y1;
                rtMEMO.x1 += 8;
                rtMEMO.y1 += 8;
                rtMEMO.x2 = rtMEMO.x1 + tempW;
                rtMEMO.y2 = rtMEMO.y1 + tempH;
                let tempuuid: number = this.utility.GenerateUniquesID();
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
            if (this.MEMO !== undefined) {
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
            if (this.MEMO !== undefined) {
                this.MEMO = undefined;
            }
        } catch (err) {
            console.log('imglblCopyPaste  clearMemo() ----> ', err.name + ': ', err.message);
        }
    }
}
