
function needLogin(ctx, next) {
  console.log('need login')
  if (!(ctx.session && ctx.session.isLogin)) {
    ctx.redirect('/login')
  }
}

async function renderPage(ctx, next) {
  await ctx.render('index.html')
}

module.exports = {
  needLogin,
  renderPage
}
