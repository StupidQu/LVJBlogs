import express from 'express';
import { BlogModel } from '../model/blog';
import { UserModel } from '../model/user';
import { PERM, UDoc } from '../interface';

const homeRouter = express.Router();

homeRouter.get('/', (req, res) => {
  const blogs = BlogModel.getMany()
    .filter(doc => (!doc.hidden || UserModel.hasPerm(req.session.user as UDoc, PERM.PERM_VIEW_HIDDEN_BLOG)))
    .sort((blog1, blog2) => blog2._id - blog1._id)
    .slice(0, 30)
    .map((blog) => {
      return {
        ...blog,
        author: UserModel.loadUser(blog.owner)
      }
    });
  res.render('home.njk', {
    pagetitle: 'Home',
    blogs,
    ...req.UiContext,
  });
});

export default homeRouter;
