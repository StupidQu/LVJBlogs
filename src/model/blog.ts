import { BlogDoc, PERM, UDoc } from '../interface';
import fs from 'fs';
import { UserModel } from './user';

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

    static delete(id: number) {
        fs.unlink(`data/blogs/${id}.json`, () => {});
    }

    static canEdit(id: number, user: UDoc) {
        if (UserModel.hasPerm(user, PERM.PERM_EDIT_BLOG)) return true;
        const blogDoc = BlogModel.get(id);
        if (blogDoc.owner === user.id && UserModel.hasPerm(user, PERM.PERM_EDIT_OWN_BLOG)) return true;
        return false
    }
}
