import express from 'express';
import { BlogModel } from '../model/blog';
import { UserModel } from '../model/user';
import { PERM } from '../interface';

const blogRouter = express.Router();

blogRouter.get('/blog/:id', (req, res) => {
    if (!req.session.user) {
        res.redirect('/user/login');
        return;
    }
    if (!BlogModel.has(Number.parseInt(req.params.id, 10))) {
        res.status(404).end();
        return;
    }
    if (!UserModel.hasPerm(req.session.user, PERM.PERM_VIEW_BLOG)) {
        res.status(403).end();
        return;
    }
    const __blogDoc = BlogModel.get(Number.parseInt(req.params.id, 10));
    const blogDoc = {
        ...__blogDoc,
        author: UserModel.loadUser(__blogDoc.owner),
        postAt: new Date(__blogDoc.publishedAt).toDateString(),
    };
    blogDoc.content = req.markdown.render(blogDoc.content);
    blogDoc
    res.render('blog.njk', {
        blog: blogDoc,
        pagetitle: 'Blog',
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

export default blogRouter;
