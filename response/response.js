export class GetResponse {
    constructor(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}


export class PostResponse {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}
