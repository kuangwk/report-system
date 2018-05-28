const koaBody = require('koa-body')
const Router = require('koa-router')

const userController = require('./users')
const projectController = require('./project')

function init () {
  const router = new Router()
  router.post('/api/*', koaBody())
  userController.init(router)
  projectController.init(router)
  return router
}

module.exports = {
  init
}