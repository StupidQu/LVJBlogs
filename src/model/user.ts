import { UDoc } from "../interface";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DEFAULT_PERM = 1;

export class UserModel {
    static loadUser(uidOrPath: number | string): UDoc {
        if (typeof uidOrPath === 'string') {
            return JSON.parse(fs.readFileSync(uidOrPath).toString());
        } else {
            return JSON.parse(fs.readFileSync(`data/users/${uidOrPath}.json`).toString());
        }
    }

    static hasPerm(user: UDoc, perm: number): boolean {
        return (user.permission >> perm & 1) === 1;
    }

    static hasUser(user: number | string) {
        if (typeof user === 'number') {
            return fs.existsSync(`data/users/${user}.json`);
        } else {
            const username = user;
            const usersList = fs.readdirSync('data/users/');
            return usersList.some((user) => {
                const userDoc = UserModel.loadUser(path.join('data/users/', user));
                return userDoc.username === username;
            });
        }
    }

    static loadUserByName(username: string): UDoc {
        const usersList = fs.readdirSync('data/users/');
        for (const user of usersList) {
            const userDoc = UserModel.loadUser(path.join('data/users/', user));
            if (userDoc.username === username) {
                return userDoc;
            }
        }
        throw new Error(`Can't find user ${username}.`);
    }

    static login(username: string, password: string) {
        if (!UserModel.hasUser(username)) return false;
        const user = UserModel.loadUserByName(username);
        const passwordSha256 = crypto.createHash('sha256').update(username + password).digest('hex');
        if (user.password === passwordSha256) {
            return user;
        } else {
            return false;
        }
    }

    static maxUserUid() {
        const usersList = fs.readdirSync('data/users/');
        let maxUid = 0;
        for (const user of usersList) {
            const uid = parseInt(user.split('.')[0]);
            if (uid > maxUid) maxUid = uid;
        }
        return maxUid;
    }

    static saveUser(udoc: UDoc) {
        fs.writeFileSync(`data/users/${udoc.id}.json`, JSON.stringify(udoc));
        return udoc;
    }

    static register(username: string, password: string, email: string) {
        return UserModel.saveUser({
            id: UserModel.maxUserUid() + 1,
            username,
            password: crypto.createHash('sha256').update(username + password).digest('hex'),
            email,
            permission: DEFAULT_PERM,
        });
    }
}
