import express from 'express';
import { BlogModel } from '../model/blog';
import { UserModel } from '../model/user';
import { PERM } from '../interface';

const blogRouter = express.Router();

blogRouter.get('/blog/:id', (req, res) => {
    if (!BlogModel.has(Number.parseInt(req.params.id, 10))) {
        res.status(404).end();
        return;
    }
    if (req.session.user && !UserModel.hasPerm(req.session.user, PERM.PERM_VIEW_BLOG)) {
        res.status(403).end();
        return;
    }
    const __blogDoc = BlogModel.get(Number.parseInt(req.params.id, 10));
    if (__blogDoc.hidden && !UserModel.hasPerm(req.session.user, PERM.PERM_VIEW_HIDDEN_BLOG)) {
        res.status(403).end();
        return;
    }
    const blogDoc = {
        ...__blogDoc,
        author: UserModel.loadUser(__blogDoc.owner),
        postAt: new Date(__blogDoc.publishedAt).toDateString(),
    };
    blogDoc.content = req.markdown.render(blogDoc.content);
    res.render('blog.njk', {
        blog: blogDoc,
        pagetitle: blogDoc.title,
        PERM_HIDE: UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_BLOG),
        PERM_DELETE: UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_BLOG),
        PERM_EDIT: UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_BLOG) 
            || (UserModel.hasPerm(req.session.user, PERM.PERM_EDIT_OWN_BLOG) && blogDoc.owner === req.session.user?.id),
        ...req.UiContext,
    })
});

blogRouter.get('/post', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_POST_BLOG)) {
        res.status(403).end();
        return;
    }
    res.render('post.njk', {
        pagetitle: 'Post',
        ...req.UiContext,
    })
});

blogRouter.post('/post', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_POST_BLOG)) {
        res.status(403).end();
        return;
    }
    if (!req.body.title || !req.body.content) {
        res.status(400).end();
        return;
    }
    const blog = BlogModel.add({
        _id: 0,
        title: req.body.title,
        content: req.body.content,
        owner: req.session.user.id,
        publishedAt: Date.now(),
        rating: 0,
    });
    res.redirect(`/blog/${blog._id}`);
});

blogRouter.get('/blog/:id/edit', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!BlogModel.canEdit(Number.parseInt(req.params.id, 10), req.session.user)) {
        res.status(403).end();
        return;
    }
    const blog = BlogModel.get(Number.parseInt(req.params.id, 10));
    res.render('edit.njk', {
        blog,
        pagetitle: 'Edit',
        ...req.UiContext,
    })
})

blogRouter.post('/blog/:id/edit', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!BlogModel.canEdit(Number.parseInt(req.params.id, 10), req.session.user)) {
        res.status(403).end();
        return;
    }
    if (!req.body.title || !req.body.content) {
        res.status(400).end();
        return;
    }
    const blogDoc = BlogModel.get(Number.parseInt(req.params.id, 10));
    BlogModel.update({
        ...blogDoc,
        title: req.body.title,
        content: req.body.content,
    });
    res.redirect(`/blog/${blogDoc._id}`);
});

export default blogRouter;
