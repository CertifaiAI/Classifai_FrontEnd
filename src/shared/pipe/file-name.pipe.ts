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
