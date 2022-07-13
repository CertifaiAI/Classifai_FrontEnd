export class DynamicFormObject<T> {
    value: T | undefined;
    required: boolean;
    key: string;
    type: string;

    constructor(options: { value: T | undefined; required: boolean; key: string; type: string }) {
        this.value = options.value;
        this.required = options.required;
        this.key = options.key;
        this.type = options.type;
    }
}
