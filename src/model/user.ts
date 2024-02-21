import { UDoc } from "../interface";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DEFAULT_PERM = 1;

export class User {
    user: UDoc;

    constructor(user: UDoc) {
        this.user = user;
        this.saveUser();
    }

    serialize() {
        return JSON.stringify(this.user);
    }

    private saveUser() {
        fs.writeFile(`data/users/${this.user.id}.json`, this.serialize(), (err) => {
            if (err) throw err;
        });
    }

    hasPermission(perm: number): boolean {
        return ((this.user.permission >> perm & 1) == 1);
    }

    setPermission(perm: number, value: number) {
        this.user.permission = this.user.permission ^ (value << perm);
        this.saveUser();
    }

    changeSetting<T extends keyof UDoc>(setting: T, value: UDoc[T]) {
        this.user[setting] = value;
        this.saveUser();
    }

    getSetting(setting: keyof UDoc) {
        return this.user[setting];
    }
}

export class UserModel {
    static loadUser(uidOrPath: number | string): User {
        if (typeof uidOrPath === 'string') {
            console.log(uidOrPath, fs.readFileSync(uidOrPath).toString());
            return new User(JSON.parse(fs.readFileSync(uidOrPath).toString()));
        } else {
            return new User(JSON.parse(fs.readFileSync(`data/users/${uidOrPath}.json`).toString()));
        }
    }

    static hasUser(user: number | string) {
        if (typeof user === 'number') {
            return fs.existsSync(`data/users/${user}.json`);
        } else {
            const username = user;
            const usersList = fs.readdirSync('data/users/');
            return usersList.some((user) => {
                const userDoc = UserModel.loadUser(path.join('data/users/', user));
                return userDoc.getSetting('username') === username;
            });
        }
    }

    static loadUserByName(username: string): User {
        const usersList = fs.readdirSync('data/users/');
        for (const user of usersList) {
            const userDoc = UserModel.loadUser(path.join('data/users/', user));
            if (userDoc.getSetting('username') === username) {
                return userDoc;
            }
        }
        throw new Error(`Can't find user ${username}.`);
    }

    static login(username: string, password: string) {
        if (!UserModel.hasUser(username)) return false;
        const user = UserModel.loadUserByName(username);
        const passwordSha256 = crypto.createHash('sha256').update(username + password).digest('hex');
        if (user.getSetting('password') === passwordSha256) {
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

    static register(username: string, password: string, email: string) {
        return new User({
            id: UserModel.maxUserUid() + 1,
            username,
            password: crypto.createHash('sha256').update(username + password).digest('hex'),
            email,
            permission: DEFAULT_PERM,
        });
    }
}
