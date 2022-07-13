import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DynamicFormObject } from 'shared/components/forms/dynamic-form/dynamic-form-object';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'any',
})
export class DynamicFormService {
    form!: FormGroup;

    toFormGroup = (inputs: DynamicFormObject<string>[]) => {
        const group: any = {};
        inputs.forEach((input) => {
            group[input.key] = input.required
                ? new FormControl(input.value, Validators.required)
                : new FormControl(input.value);
        });
        return new FormGroup(group);
    };
}
