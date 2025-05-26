import * as fs from "fs";
import * as path from "path";

export class Content {
    constructor(private readonly docsDirectory: string) {
        this.docsDirectory = docsDirectory;
    }

    load(): { content: string; filePath: string }[] {
        const files = fs.readdirSync(this.docsDirectory, {recursive: true});
        const mdxFiles = files.filter((file) => file.toString().endsWith(".mdx"));
        return mdxFiles.map((file) => {
            const filePath = path.join(this.docsDirectory, file.toString());
            // console.log("Loading file:", filePath);
            const content = fs.readFileSync(filePath, "utf-8");
            return {content, filePath};
        });
    }
}
