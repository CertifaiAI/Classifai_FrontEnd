import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SharedUndoRedoService {
    action: BehaviorSubject<string> = new BehaviorSubject('');
}
