const { needLogin, renderPage } = require('../utils')
const ProjectModel = require('../models/project')
const ReportModel = require('../models/report')

async function addProject(ctx, next) {
  needLogin(ctx, next)
  const data = ctx.request.body
  const projectObj = new ProjectModel({
    name: data.project
  })
  try {
    let ret = await projectObj.save()
    console.log('insert success')
    ctx.redirect('/')
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
  console.log('index page')
  needLogin(ctx, next)
  await renderPage(ctx, next)
  next()
}

async function projectPage(ctx, next) {
  console.log('project page');
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

async function getActions(appId) {
  return await ReportModel.findActionsByAppId(appId)
}

async function findProject(appId) {
  const project = await ProjectModel.findById(appId)
  if (!project) {
    throw 'project not found'
  }
  return project || {}
}

async function getProjectById(ctx, next) {
  const appId = ctx.params.appId
  return Promise.all([findProject(appId), getActions(appId)]).then(([project, actions]) => {
    ctx.body = {
      project,
      actions
    }
  }).catch(()=> {
    ctx.throw(401, 'project not found')
  })
}

function init(router) {
  router.get('/api/projects', getProjects)
  router.post('/api/project/add', addProject)
  router.get('/api/project/:appId', getProjectById)
  router.get('/project/:appId', projectPage)
  router.get('/', index)
}


module.exports = {
  init
}