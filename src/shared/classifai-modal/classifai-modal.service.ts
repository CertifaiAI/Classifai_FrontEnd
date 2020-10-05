import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClassifaiModalService {
    private modals: any[] = [];

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string = 'custom-modal-1') {
        // remove modal from array of active modals
        this.modals = this.modals.filter((x) => x.id !== id);
        // this.modals = this.modals = [];
    }

    open(id: string = 'custom-modal-1') {
        // open modal specified by id
        const modal = this.modals.find((x) => x.id === id);
        // console.log(modal);
        modal.open();
    }

    close(id: string = 'custom-modal-1') {
        // close modal specified by id
        const modal = this.modals.find((x) => x.id === id);
        // console.log(modal);
        modal.close();
    }
}
