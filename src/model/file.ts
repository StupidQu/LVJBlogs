import fs from 'fs';
import { FileMetadata } from '../interface';

export class FileModel {
    static getMetadata(sha256: string): FileMetadata | undefined {
        if (!fs.existsSync(`data/uploads-info/${sha256}.json`)) return undefined;
        const meta = JSON.parse(fs.readFileSync(`data/uploads-info/${sha256}.json`).toString());
        return meta;
    }
    
    static delete(sha256: string) {
        if (!fs.existsSync(`data/uploads-info/${sha256}.json`)) return;
        const extName = FileModel.getMetadata(sha256)?.originalName.split('.').pop();
        fs.unlinkSync(`data/uploads-info/${sha256}.json`);
        fs.unlinkSync(`data/uploads/${sha256}.${extName}`);
    }

    static saveMetadata(sha256: string, meta: FileMetadata) {
        fs.writeFile(`data/uploads-info/${sha256}.json`, JSON.stringify(meta), (err) => {
            if (err) throw err;
        });
    }

    static getManyMeta(): FileMetadata[] {
        return fs.readdirSync(`data/uploads-info/`)
            .filter((file) => file.endsWith('.json'))
            .map((file) => {
                const meta = JSON.parse(fs.readFileSync(`data/uploads-info/${file}`).toString());
                return meta;
            });
    }
}
