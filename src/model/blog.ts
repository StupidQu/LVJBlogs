import { BlogDoc } from '../interface';
import fs from 'fs';

export class BlogModel {
    static getNextID() {
        const blogsList = fs.readdirSync('data/blogs/');
        let maxId = 0;
        blogsList.forEach((blogName) => {
            const id = parseInt(blogName.split('.')[0]);
            if (id > maxId) {
                maxId = id;
            }
        });
        return maxId + 1;
    }

    static add(blog: BlogDoc) {
        blog._id = BlogModel.getNextID();
        fs.writeFileSync(`data/blogs/${blog._id}.json`, JSON.stringify(blog));
        return blog;
    }

    static update(blog: BlogDoc) {
        fs.writeFileSync(`data/blogs/${blog._id}.json`, JSON.stringify(blog));
    }

    static has(id: number) {
        return fs.existsSync(`data/blogs/${id}.json`);
    }

    static get(id: number): BlogDoc {
        const blog = fs.readFileSync(`data/blogs/${id}.json`);
        return JSON.parse(blog.toString());
    }

    static getMany(): BlogDoc[] {
        const blogsList = fs.readdirSync('data/blogs/');
        return blogsList.map((blogName) => {
            const id = parseInt(blogName.split('.')[0]);
            return BlogModel.get(id);
        });
    }
}
