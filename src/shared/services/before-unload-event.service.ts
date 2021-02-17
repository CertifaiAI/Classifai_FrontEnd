import { filter } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'any',
})
export class BeforeUnloadEventService {
    constructor() {}

    public beforeUnload = (showWarnDialog: boolean, callbackFn: () => void) => {
        // fromEvent(window, 'beforeunload')
        //     .pipe(filter(() => showWarnDialog))
        //     .subscribe(
        //         (event: BeforeUnloadEvent) => {
        //             const message = 'Are you sure to browse away?';
        //             (event || window.event).returnValue = message;
        //             return message;
        //         },
        //         (err: Error) => {},
        //         () => {
        //             window.onunload = () => {
        //                 callbackFn();
        //                 console.log('true');
        //                 alert('xx');
        //             };
        //         },
        //     );
        if (showWarnDialog === true) {
            window.addEventListener('beforeunload', (e) => {
                const confirmationMessage = 'Are you sure to browse away?';

                // tslint:disable-next-line: deprecation
                (e || window.event).returnValue = confirmationMessage; // Gecko + IE
                return confirmationMessage; // Webkit, Safari, Chrome etc.
            });

            window.addEventListener('unload', () => {
                callbackFn();
                alert('xx');
            });

            // window.addEventListener('focus', (e) => {
            //     if (didEnterBeforeUnload) {
            //         console.log('pressed cancel');
            //     }

            //     didEnterBeforeUnload = false;
            // });
        }
    };
}
