import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: ModalComponent[] = [];

    add = (modal: any) => {
        // add modal to array of active modals
        this.modals.push(modal);
    };

    remove = (inputId: string) => {
        // remove modal from array of active modals
        this.modals = this.modals.filter(({ id }) => id !== inputId);
        // this.modals = this.modals = [];
    };

    open = (inputId: string) => {
        // open modal specified by id
        const modal = this.modals.find(({ id }) => id === inputId);
        // console.log(modal);
        modal?.open();
    };

    close = (inputId: string) => {
        // close modal specified by id
        // console.log(this.modals);
        const modal = this.modals.find(({ id }) => id === inputId);
        // console.log(modal);
        modal?.close();
    };
}
