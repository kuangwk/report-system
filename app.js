const Koa = require('koa')
const session = require('koa-session')
const views = require('koa-views')
const static = require('koa-static')

const db = require('./db')
const controller = require('./controllers')

const app = new Koa();

app.keys = ['what a sc']

app.use(views(__dirname + '/client'))

app.use(session(app))

const router = controller.init()
app.use(router.routes())

app.use(static(__dirname + '/client'))

console.log('lintening 3000')
app.listen(3000);

db.init()
