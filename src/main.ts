import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import * as randomString from 'randomstring';
import userRouter from './routers/user';
import homeRouter from './routers/home';
import blogRouter from './routers/blog';
import fileRouter from './routers/file';
import adminRouter from './routers/admin';
import MarkdownIt from 'markdown-it';
import { markdownItTable } from 'markdown-it-table';
import { UDoc } from './interface';

const app = express();
app.use(session({
  secret: randomString.generate(),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

declare module 'express-session' {
  interface SessionData {
    user?: UDoc,
  }
}

declare global {
  namespace Express {
    interface Request {
      UiContext: {
        cdnUrl: string;
        user?: UDoc;
      };
      markdown: MarkdownIt;
    }
  }
}

const markdown = new MarkdownIt('commonmark');
markdown.use(markdownItTable);

nunjucks.configure('views/', {
  watch: true,
  autoescape: true,
  express: app,
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.UiContext = {
    cdnUrl: 'https://file-cdn.tboj.cn',
    user: req.session.user,
  };
  req.markdown = markdown;
  next();
});

app.use('/static/', express.static('static/'));

app.use(userRouter);
app.use(homeRouter);
app.use(blogRouter);
app.use(fileRouter);
app.use(adminRouter);

app.listen(8080, () => {
  console.log('Server started on port 8080.');
});
