import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: ModalComponent[] = [];

    add(modal: any) {
        // add modal to array of active modals
        // console.log(modal);
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter((x) => x.id !== id);
        // this.modals = this.modals = [];
    }

    open(id: string) {
        // open modal specified by id
        const modal = this.modals.find((x) => x.id === id);
        // console.log(modal);
        modal?.open();
    }

    close(id: string) {
        // close modal specified by id
        const modal = this.modals.find((x) => x.id === id);
        // console.log(modal);
        modal?.close();
    }
}
