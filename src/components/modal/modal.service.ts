/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: ModalComponent[] = [];

    add = (modal: ModalComponent) => {
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
