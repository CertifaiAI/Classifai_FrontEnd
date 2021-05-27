/** @interface icons' object mapping */
type IconConfigs = {
    imgPath: string;
    hoverLabel: string;
    alt: string;
    nonClickable?: boolean;
    style?: string;
    // inputType?: string;
    // accept?: 'image/x-png,image/jpeg';
    toggleable?: boolean;
    /** @function responsible for toggling function */
    onClick: (arg: any) => void;
    /** @function responsible for uploading thumbnail(s) */
    // onUpload?();
};

/** @interface backbone of icons' object schema */
export type IconSchema = {
    [key: string]: Array<IconConfigs>;
};
