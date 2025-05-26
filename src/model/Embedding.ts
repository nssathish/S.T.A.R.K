export class Embedding {
    constructor(private readonly filePath: string,
                private readonly content: string,
                private readonly embedding: number[]) {
        this.filePath = filePath;
        this.content = content;
        this.embedding = embedding;
    }

    get FilePath(): string {
        return this.filePath;
    }

    get Content(): string {
        return this.content;
    }

    get Embedding(): number[] {
        return this.embedding;
    }
}