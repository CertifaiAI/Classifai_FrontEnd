type error_code = number;
type errormessage = string;
type content = string[];
type message = boolean | number;
type uuid_list = number;
type img_src = string;

export type MessageContent<TContent = undefined> = {
    content: TContent extends undefined ? content : TContent;
    message: message;
    errormessage: errormessage;
};

export type Message = {
    message: message;
};

export type MessageUuidList = {
    message: message;
    uuid_list: uuid_list[];
};

export type MessageBase64Img = {
    message: message;
    img_src: img_src;
    errorcode: error_code;
    errormessage: string;
};

export type MessageProjectProgress = {
    error_code?: error_code;
    error_message?: errormessage;
    message: message;
};
