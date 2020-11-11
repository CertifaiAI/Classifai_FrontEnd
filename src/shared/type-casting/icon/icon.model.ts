/** @interface icons' object mapping */
type IconConfigs = {
    imgPath: string;
    hoverLabel: string;
    alt: string;
    // inputType?: string;
    // accept?: 'image/x-png,image/jpeg';
    /** @function responsible for toggling function */
    onClick?: any;
    // onClick?: (...args: any[]) => any;
    /** @function responsible for uploading thumbnail(s) */
    // onUpload?();
};

/** @interface backbone of icons' object schema */
export type IconSchema = {
    [key: string]: Array<IconConfigs>;
};
