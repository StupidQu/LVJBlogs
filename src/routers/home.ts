import express from 'express';
import { BlogModel } from '../model/blog';
import { UserModel } from '../model/user';

const homeRouter = express.Router();

homeRouter.get('/', (req, res) => {
  if (!req.session.user) {
    res.redirect('/user/login');
    return;
  }
  const blogs = BlogModel.getMany()
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
