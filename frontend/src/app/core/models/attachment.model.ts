export class Attachment {
    public id: string;
    public mimeType: string;
    public fileName: string;
    constructor(id: string, mimeType: string, fileName: string) {
        this.id = id;
        this.mimeType = mimeType;
        this.fileName = fileName;
    }

}
