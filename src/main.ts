import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import * as randomString from 'randomstring';
import { User } from './model/user';
import userRouter from './routers/user';

const app = express();
app.use(session({
  secret: randomString.generate(),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

declare module 'express-session' {
  interface SessionData {
    user: User,
  }
}

declare global {
  namespace Express {
    interface Request {
      UiContext: {
        cdnUrl: string;
      };
    }
  }
}

nunjucks.configure('views/', {
  watch: true,
  autoescape: true,
  express: app,
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.UiContext = {
    cdnUrl: '',
  };
  next();
});

app.use('/static/', express.static('static/'));

app.use(userRouter);

app.listen(8888, () => {
  console.log('Server started on port 8888.');
});
