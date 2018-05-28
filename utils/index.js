
 function needLogin(ctx, next) {
  if (!(ctx.session && ctx.session.isLogin)) {
    ctx.redirect('/login')
  }
}

module.exports = {
  needLogin
}
