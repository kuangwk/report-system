const Koa = require('koa')
const session = require('koa-session')
const views = require('koa-views')
const staticCache = require('koa-static-cache')
const { keys, admin } = require('./server/config')

const db = require('./server/db')
const controller = require('./server/controllers')

if (!keys || !(0 in keys)) {
  throw new Error("必须先设定 /server/config.js 中 keys 字段")
}

if (!admin.username || !admin.password) {
  throw new Error("必须先设定 /server/config.js 中 admin.username, admin.password 字段")
}

const app = new Koa();

app.keys = keys

app.use(views(__dirname + '/client'))

app.use(session(app))

const router = controller.init()
app.use(router.routes())

app.use(staticCache(__dirname + '/client'), {
  maxAge: 60 * 60 * 24
})

console.log('lintening 3002')
app.listen(3002);

db.init()
