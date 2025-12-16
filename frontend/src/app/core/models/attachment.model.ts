export class Attachment {
    public id?: string;
    public mimeType?: string;
    public fileName?: string;
    public accessors?: string[];
    constructor(id?: string, mimeType?: string, fileName?: string, accessors?: string[]) {
        this.id = id;
        this.mimeType = mimeType;
        this.fileName = fileName;
        this.accessors = accessors;
    }

}
