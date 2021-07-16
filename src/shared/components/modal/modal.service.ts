/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: ModalComponent[] = [];
    public openedModalsId: string[] = [];

    add = (modal: ModalComponent) => {
        // add modal to array of active modals
        this.modals.push(modal);
    };

    remove = (inputId: string) => {
        // remove modal from array of active modals
        this.modals = this.modals.filter(({ id }) => id !== inputId);
    };

    open = (inputId: string) => {
        // open modal specified by id
        const modal = this.modals.find(({ id }) => id === inputId);
        modal && this.openedModalsId.push(modal.id);
        modal?.open();
    };

    close = (inputId: string) => {
        // close modal specified by id
        const modal = this.modals.find(({ id }) => id === inputId);
        modal?.close();
    };

    // Check is there any modal currently opened
    isOpened = () => {
        return this.openedModalsId.length > 0 ? true : false;
    };
}
