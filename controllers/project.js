const { needLogin } = require('../utils')
const ProjectModel = require('../models/project')

async function addProject(ctx, next) {
  needLogin(ctx, next)
  const data = ctx.request.body
  const projectObj = new ProjectModel({
    name: data.project
  })
  try {
    let ret = await projectObj.save()
    console.log('insert success')
    ctx.redirect('back')
    next()
  } catch (err) {
    if (err && err.code === 11000) {
      ctx.body = '名称重复了'
    } else {
      ctx.body = '插入失败'
    }
    next()
  }
}

async function index(ctx, next) {
  needLogin(ctx, next)
  list = await ProjectModel.find()
  const links = list.map((item) => {
    return `<a href='/project/${item._id}'>${item.name}</a>`
  })

  const pageStr = `
    <h1>mmREPORTs</h1>
    ${links.join('</br>')}
    <form method='post' action='/api/project/add'>
      <input name='project'></input>
      <input type="submit" value="Save">
    </form>
  `
  ctx.body = pageStr
  next()
}

function init(router) {
  router.post('/api/project/add', addProject)
  router.get('/', index)
}


module.exports = {
  init
}