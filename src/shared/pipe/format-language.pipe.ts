import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'languageSlice' })
export class FormatLanguagePipe implements PipeTransform {
    transform(lang: string): string {
        // console.log(lang);
        let newStr: string = '';
        switch (lang.slice(-2)) {
            case 'en':
                newStr = 'EN';
                break;

            case 'cn':
                newStr = 'CN';
                break;

            case 'ms':
                newStr = 'MS';
                break;

            default:
                break;
        }
        return newStr;
    }
}
