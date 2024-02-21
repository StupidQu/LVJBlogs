import express from 'express';
import { UserModel } from '../model/user';
import crypto from 'crypto';
import { PERM } from '../interface';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const fileRouter = express.Router();
const BASE_URL = 'https://blog.tboj.cn/file/';

fileRouter.get('/file', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_UPLOAD_FILE)) {
        res.status(403).end();
        return;
    }
    res.render('file.njk', {
        pagetitle: 'File',
        ...req.UiContext,
    })
});

const uploader = multer({ dest: 'data/uploads-tmp/' });
fileRouter.post('/file', (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_UPLOAD_FILE)) {
        res.status(403).end();
        return;
    }
    next();
}, uploader.single('file'), (req, res) => {
    if (!req.file) {
        res.end(JSON.stringify({
            success: false,
            message: '文件不合法',
        }));
        return;
    }
    const originalName = req.file.originalname;
    const tmpFilePath = req.file.path;
    fs.readFile(req.file.path, (err, data) => {
        if (err) {
            console.error(err);
            res.end(JSON.stringify({
                success: false,
                message: err.message,
            }));
            return;
        }
        const sha256 = crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
        const filename = `${sha256}.${originalName.split('.')[originalName.split('.').length - 1]}`;
        const filepath = `data/uploads/${filename}`;
        fs.writeFile(filepath, data, (err) => {
            if (err) {
                console.error(err);
                res.end(JSON.stringify({
                    success: false,
                    message: err.message,
                }));
                return;
            }
            res.end(JSON.stringify({
                success: true,
                message: '',
                link: BASE_URL + filename,
            }));
            fs.unlink(tmpFilePath, () => {});
        });
    })
});

fileRouter.get('/file/:path', (req, res) => {
    if (!fs.existsSync(`data/uploads/${req.params.path}`)) {
        res.status(404).end();
        return;
    }
    res.sendFile(path.join(process.cwd(), `data/uploads/${req.params.path}`));
    return;
});

export default fileRouter;
