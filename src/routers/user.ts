import express from 'express';
import { UserModel } from '../model/user';
import rateLimit from 'express-rate-limit';

const userRouter = express.Router();

userRouter.get('/user/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
    res.end();
    return;
  }
  res.render('login.njk', {
    pagetitle: 'Login',
    ...req.UiContext,
  });
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: () => {
    return `Too many login attempts, please try again later.`;
  }
});

userRouter.post('/user/login', loginLimiter, (req, res) => {
  function failed(msg: string) {
    res.render('login.njk', {
      pagetitle: 'Login',
      ...req.UiContext,
      error: msg,
    });
  }

  if (!/^[0-9a-zA-Z]*$/.test(req.body.username) || !/^[0-9a-zA-Z]*$/.test(req.body.password)) {
    failed('账号或密码错误，请检查后重试。');
    return;
  }

  const user = UserModel.login(req.body.username, req.body.password);
  if (user) {
    req.session.user = user;
    res.redirect('/');
    res.end();
  } else {
    failed('账号或密码错误，请检查后重试。');
    return;
  }
});

userRouter.get('/user/register', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
    res.end();
    return;
  }
  res.render('register.njk', {
    pagetitle: 'Register',
    ...req.UiContext,
  });
});

userRouter.post('/user/register', (req, res) => {
  function failed(msg: string) {
    res.render('register.njk', {
      pagetitle: 'Register',
      ...req.UiContext,
      error: msg,
    });
  }

  if (!/^[0-9a-zA-Z]*$/.test(req.body.username) || !/^[0-9a-zA-Z]*$/.test(req.body.password)) {
    failed('账号或密码不合法。');
    return;
  }
  if (!/^\w*@\w*\.\w*$/.test(req.body.email)) {
    failed('邮箱格式不正确。');
    return;
  }
  if (UserModel.hasUser(req.body.username)) {
    failed('该账号已被注册。');
    return;
  }
  req.session.user = UserModel.register(req.body.username, req.body.password, req.body.email);
  res.redirect('/');
  return;
});

export default userRouter;
