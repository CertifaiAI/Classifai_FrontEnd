import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ShortcutKeyService {
    constructor() {}

    checkKey(ctrlKey: boolean, metaKey: boolean, shiftKey: boolean, key: string, keyCheck: string) {
        let isCorrectKey = false;
        const modKey = ctrlKey || metaKey;
        switch (keyCheck) {
            case 'copy':
                isCorrectKey = modKey && (key === 'c' || key === 'C');
                break;
            case 'paste':
                isCorrectKey = modKey && (key === 'v' || key === 'V');
                break;
            case 'redo':
                isCorrectKey = modKey && shiftKey && (key === 'z' || key === 'Z');
                break;
            case 'undo':
                isCorrectKey = modKey && (key === 'z' || key === 'Z');
                break;
        }
        return isCorrectKey;
    }
}
