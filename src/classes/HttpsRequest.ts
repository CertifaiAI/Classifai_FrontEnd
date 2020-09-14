import { Metadata, progressTuple } from './CustomType';
import { utils } from './utils';

export class HttpRequest {
    private referrer: string;
    private utility: utils;
    constructor(windowloc) {
        this.referrer = windowloc;
        this.utility = new utils();
    }

    public GetRequest(url: string, callbacks: Function, timeout: number, domain: string) {
        try {
            var self = this;
            var http = new XMLHttpRequest();
            http.timeout = timeout;
            http.open('GET', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onload = function () {
                if (http.readyState == 4 && http.status == 200) {
                    callbacks(http.responseText);
                } else {
                    let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                    window.location.replace(parurl + '404');
                }
            };
            http.ontimeout = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '404');
            };
            http.onerror = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '500');
            };
            http.send();
        } catch (err) {
            console.log(
                'GetRequest(url:string, callbacks:Function, timeout:number, domain:string) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public PutRequest(url: string, param: Object, callbacks: Function, timeout: number, domain: string) {
        try {
            var self = this;
            var json = JSON.stringify(param);
            var http = new XMLHttpRequest();
            http.timeout = timeout;
            http.open('PUT', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onload = function () {
                if (http.readyState == 4 && http.status == 200) {
                    callbacks(http.responseText);
                } else {
                    let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                    window.location.replace(parurl + '404');
                }
            };
            http.ontimeout = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '404');
            };
            http.onerror = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '500');
            };
            http.send(json);
        } catch (err) {
            console.log(
                'PutRequest(url:string, param:Object, callbacks:Function, timeout:number, domain:string) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public PostRequest(url: string, param: Object, callbacks: Function, timeout: number, domain: string) {
        try {
            var self = this;
            var json = JSON.stringify(param);
            var http = new XMLHttpRequest();
            http.timeout = timeout;
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onload = function () {
                if (http.readyState == 4 && http.status == 200) {
                    callbacks(http.responseText);
                } else {
                    let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                    window.location.replace(parurl + '404');
                }
            };
            http.ontimeout = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '404');
            };
            http.onerror = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '500');
            };
            http.send(json);
        } catch (err) {
            console.log(
                'PostRequest(url:string, param:Object, callbacks:Function, timeout:number, domain:string) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public DeleteRequest(url: string, callbacks: Function, timeout: number, domain: string) {
        try {
            var self = this;
            var http = new XMLHttpRequest();
            http.timeout = timeout;
            http.open('DELETE', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onload = function () {
                if (http.readyState == 4 && http.status == 200) {
                    callbacks(http.responseText);
                } else {
                    let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                    window.location.replace(parurl + '404');
                }
            };
            http.ontimeout = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '404');
            };
            http.onerror = () => {
                let parurl = self.referrer.substring(0, self.referrer.lastIndexOf(domain));
                window.location.replace(parurl + '500');
            };
            http.send();
        } catch (err) {
            console.log(
                'DeleteRequest(url:string, callbacks:Function, timeout:number, domain:string) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }

    public RecursPutRequest(
        iter: number,
        max_iter: number,
        timeout: number,
        arr_content: progressTuple[],
        callbacks: Function,
    ) {
        try {
            var self = this;
            let urls: string = arr_content[iter].url;
            let ThisObject: Metadata = JSON.parse(JSON.stringify(arr_content[iter].data));
            ThisObject.imgthumbnail = '';
            let Jobj = this.utility.StringifyObject(ThisObject);
            var http = new XMLHttpRequest();
            http.timeout = timeout;
            http.open('PUT', urls, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onload = function () {
                if (http.readyState == 4 && http.status == 200) {
                    iter += 1;
                    if (iter < max_iter) {
                        self.RecursPutRequest(iter, max_iter, timeout, arr_content, callbacks);
                    } else {
                        callbacks(true);
                    }
                } else {
                    let referrer = window.top.location.href;
                    let parurl = referrer.substring(0, referrer.lastIndexOf('imglbl'));
                    window.location.replace(parurl + '404');
                }
            };
            http.ontimeout = () => {
                let referrer = window.top.location.href;
                let parurl = referrer.substring(0, referrer.lastIndexOf('imglbl'));
                window.location.replace(parurl + '404');
            };
            http.onerror = () => {
                let referrer = window.top.location.href;
                let parurl = referrer.substring(0, referrer.lastIndexOf('imglbl'));
                window.location.replace(parurl + '500');
            };
            http.send(Jobj);
        } catch (err) {
            console.log(
                'RecursPutRequest(iter:number, max_iter:number, timeout:number, arr_content:progressTuple[]) ----> ',
                err.name + ': ',
                err.message,
            );
        }
    }
}
