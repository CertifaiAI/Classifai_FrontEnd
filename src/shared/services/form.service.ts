// import { Injectable } from '@angular/core';
// import {
//   FormGroup,
//   ValidatorFn,
//   Validators,
//   FormBuilder,
// } from '@angular/forms';

// @Injectable({ providedIn: 'any' })
// export class FormService {
//   constructor(private _fb: FormBuilder) {}

//   createControl(fieldJsonSchema: any): FormGroup {
//     const group = this._fb.group({});
//     fieldJsonSchema.field.forEach((field) => {
//       const control = this._fb.control(
//         field.value,
//         this.bindValidations(field.validations || [])
//       );
//       console.log(control);
//       group.addControl(field.name, control);
//     });
//     return group;
//   }

//   bindValidations(validations: any): ValidatorFn {
//     if (validations.length > 0) {
//       const validList = [];
//       validations.forEach((valid) => {
//         validList.push(valid.validator);
//       });
//       return Validators.compose(validList);
//     }
//     return null;
//   }

//   validateAllFormFields(formGroup: FormGroup): void {
//     formGroup.markAllAsTouched();
//     // Object.keys(formGroup.controls).forEach((field) => {
//     //   const control = formGroup.get(field);
//     //   control.markAsTouched({ onlySelf: true });
//     // });
//   }
// }
