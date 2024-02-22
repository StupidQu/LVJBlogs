import express from 'express';
import { UserModel } from '../model/user';
import { BlogDoc, FileMetadata, PERM, UDoc } from '../interface';
import { BlogModel } from '../model/blog';
import { FileModel } from '../model/file';

const adminRouter = express.Router();

adminRouter.get('/admin', (req, res) => {
  if (!req.session.user) {
    res.redirect('/user/login');
    return;
  }

  let body = {
    blogs: [] as (BlogDoc & { author: any, postAt: string })[],
    files: [] as (FileMetadata & { owner: UDoc, uploadAt: string })[],
  };
  const blogAdmin = UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_BLOG);
  if (blogAdmin) {
    body.blogs = BlogModel.getMany().sort((a, b) => b._id - a._id).map(doc => {
        doc.content = '';
        (doc as any).author = UserModel.loadUser(doc.owner);
        (doc as any).postAt = new Date(doc.publishedAt).toISOString();
        return doc as BlogDoc & { author: any, postAt: string };
    }).slice(0, 50); 
  }
  
  const fileAdmin = UserModel.hasPerm(req.session.user, PERM.PERM_DELETE_FILE);
  if (fileAdmin) {
    body.files = FileModel.getManyMeta()
        .sort((a, b) => b.date - a.date)
        .slice(0, 50)
        .map(doc => {
            (doc as any).owner = UserModel.loadUser(doc.user);
            (doc as any).uploadAt = new Date(doc.date).toISOString();
            return doc as FileMetadata & { owner: UDoc, uploadAt: string };
        });
  }
  
  res.render('admin.njk', {
    pagetitle: 'Admin',
    blogAdmin,
    fileAdmin,
    ...body,
    ...req.UiContext,
  });
});

adminRouter.post('/admin/blog', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_BLOG)) {
        res.status(403).end();
        return;
    }
    const action = req.body.action;
    const blogDoc = BlogModel.get(req.body.id);
    if (action === 'delete') {
        BlogModel.delete(blogDoc._id);
        res.status(200).end();
    }
    else if (action === 'hide') {
        BlogModel.update({
            ...blogDoc,
            hidden: true,
        });
        res.status(200).end();
    }
    else if (action === 'ban') {
        BlogModel.delete(blogDoc._id);
        UserModel.saveUser({
            ...req.session.user,
            permission: 0,
        });
        res.status(200).end();
    }
    else if (action === 'unhide') {
        BlogModel.update({
            ...blogDoc,
            hidden: false,
        });
        res.status(200).end();
    }
});

adminRouter.post('/admin/file', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_DELETE_FILE)) {
        res.status(403).end();
        return;
    }
    const action = req.body.action;
    if (action === 'delete') {
        FileModel.delete(req.body.sha256);
    }
    if (action === 'ban') {
        FileModel.delete(req.body.sha256);
        UserModel.saveUser({
            ...req.session.user,
            permission: 0,
        });
    }
    res.status(200).end();
});

export default adminRouter;
