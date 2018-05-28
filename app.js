const Koa = require('koa')
const session = require('koa-session')

const db = require('./db')
const controller = require('./controllers')

const app = new Koa();

app.keys = ['what a sc']

app.use(session(app))

const router = controller.init()
app.use(router.routes())

console.log('lintening 3000')
app.listen(3000);

db.init()
