import { Component, Input, OnInit } from '@angular/core';

import { DynamicFormObject } from './dynamic-form-object';
import { DynamicFormService } from 'shared/services/dynamic-form-service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {
    @Input() inputs!: DynamicFormObject<string>[];
    formGroup!: FormGroup;

    constructor(private dynamicFormService: DynamicFormService) {}

    ngOnInit(): void {
        this.formGroup = this.dynamicFormService.toFormGroup(this.inputs);
    }
}
