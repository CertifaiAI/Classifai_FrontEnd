import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileNameSlice' })
export class FileNamePipe implements PipeTransform {
    /**
     * @function responsible to transform the given image path to a proper filename
     * @param {string} name - props of image path
     * @return filename with extension
     */
    transform(name: string): string {
        // console.log(name);
        const newName = name ? name.split('\\').slice(-1)[0] : '';
        return newName;
    }
}
