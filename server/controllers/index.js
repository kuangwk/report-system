const koaBody = require('koa-body')
const Router = require('koa-router')

const userController = require('./users')
const projectController = require('./project')
const reportController = require('./report')

function init () {
  const router = new Router()
  router.post('/api/*', koaBody())
  userController.init(router)
  projectController.init(router)
  reportController.init(router)
  return router
}

module.exports = {
  init
}