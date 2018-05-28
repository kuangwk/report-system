const config = require('../config')
const { needLogin } = require('../utils')

function init(router) {

  router.post('/api/user/login', (ctx, next)=> {
    const body =  ctx.request.body
    if (body.name === config.admin.username && body.password === config.admin.password) {
      ctx.session.isLogin = true
      ctx.session.user = body.name
      ctx.redirect('/')
    } else {
      ctx.redirect('back')
    }
  })

  router.all('/api/user/logout', (ctx, next)=> {
    console.log('logout')
    ctx.session = null
    ctx.redirect('/')
  })

  router.get('/login', function showLogin(ctx, next) {
    const pageStr = `
      <h1>登录</h1>
      <form method='post' action='/api/user/login'>
        <input name='name'></input>
        <input type='passowrd' name='password'></input>
        <input type="submit" value="Save">
      </form>
    `
    ctx.body = pageStr
    next()
  })

}

module.exports = {
  init
}