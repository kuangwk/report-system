const config = require('../config')
const { needLogin, renderPage } = require('../utils')

function init(router) {

  router.post('/api/user/login', (ctx, next)=> {
    const body =  ctx.request.body
    if (body.username === config.admin.username && body.password === config.admin.password) {
      ctx.session.isLogin = true
      ctx.session.user = body.username
      ctx.redirect('/')
    } else {
      ctx.throw(401, '用户名或者密码错误')
    }
  })

  router.get('/api/user/logout', (ctx, next)=> {
    console.log('logout')
    ctx.session = null
    ctx.redirect('/')
  })

  router.get('/login', renderPage)

}

module.exports = {
  init
}