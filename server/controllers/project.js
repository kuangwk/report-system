const { needLogin, renderPage } = require('../utils')
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
      ctx.throw(401, '名称重复了')
    } else {
      ctx.throw(402, '插入失败')
    }
    next()
  }
}

async function index(ctx, next) {
  needLogin(ctx, next)
  await renderPage(ctx, next)
  next()
}

async function getProjects(ctx, next) {
  list = await ProjectModel.find()
  console.log('list', list)
  ctx.body = list
  next()
}

function init(router) {
  router.get('/api/projects', getProjects)
  router.post('/api/project/add', addProject)
  router.get('/', index)
}


module.exports = {
  init
}