export type Validator = {
  name: string;
  validator: any;
  message: string;
};
export type FieldConfig = {
  /** @Fields & Button */
  isPrimaryKey?: boolean;
  label?: string;
  placeholder?: string;
  name?: string;
  inputType?: string;
  dropdown?: any[];
  // collections?: any;
  type: string;
  value?: any;
  isShown: boolean;
  maxLength?: number;
  validations?: Validator[];
};

export interface fieldProperties {
  isPrimaryKey?: boolean;
  label?: string;
  placeholder?: string;
  name?: string;
  inputType?: string;
  dropdown?: any[];
  // collections?: any;
  fieldType: 'input' | 'textarea' | 'select' | 'autocomplete';
  value?: any;
  isShown: boolean;
  maxLength?: number;
  isDisabledOnAdd?: boolean;
  isDisabledOnEdit?: boolean;
  isHiddenForCreate?: boolean;
  duplicateCheck?: boolean;
  validations?: Validator[];
  isDate?: boolean;
  cannotResetVal?: boolean;
  // minVal?: number;
  // maxVal?: number;
  decimalPlace?: number;
}

export interface buttonProperties {
  /** @Buttons only */
  label: string;
  duplicateLink?: string;
  duplicateParams?: object;
  link?: string;
  disabledOnFormInvalid?: boolean;
  isShown: boolean;

  /* For Dialog Box */
  showDialogConfirmBtn?: boolean;
  showDialogCancelBtn?: boolean;
  // func? : Function;
}

export interface FieldConfigs {
  getFormOnChange?: boolean;
  // Feature TypeScript: Indexed Access Types or Lookup Types
  // source: https://stackoverflow.com/questions/36311284/is-there-a-way-to-extract-the-type-of-typescript-interface-property
  getFormOnChangeWith?: fieldProperties['name'];
  getFormOnPatchLink?: string;
  manualFormSubmission?: boolean;
  fields: fieldProperties[];
  buttons?: buttonProperties[];
}
