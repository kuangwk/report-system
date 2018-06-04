const monent = require('moment')

const { needLogin } = require('../utils')
const ReportModel = require('../models/report')
const RecordModel = require('../models/record')

const reportCache = {}

const {
  REAL_TIME_VIEW,
  HOUR_VIEW,
  MONTH_VIEW,
  DAY
 } = require('../../common/constant')

// 有上报后多久自动保存到数据库
const AUTO_SAVE_DELAY = 1 * 1000  // TODOS: 间距改大一点

function addToReportCache(appId, action) {
  const timeStr = +(new Date()).setSeconds(0, 0)
  const key = `${appId}_${action}`
  let cacheItem = reportCache[key]
  if (cacheItem) {
    if (cacheItem[timeStr]) {
      cacheItem[timeStr] += 1
    } else {
      cacheItem[timeStr] = 1
    }
  } else {
    reportCache[key] = {}
    reportCache[key][timeStr] = 1
  }
  return reportCache[key][timeStr]
}

async function saveAction(action, appId) {
    // 保存 action
    try {
      await ReportModel.findOneOrCreate({ action, appId })
    } catch (error) {
      console.error('保存 action 失败', error)
    }
}

async function saveRecords(records, appId, action) {
  try {
    await Promise.all(records.map(async (record)=> {
      await RecordModel.findOneAndUpdate({
        appId, action, reportTime: record.time
      }, {
        $inc: {
          count: record.count
        }
      }, {
        upsert: true,
        setDefaultsOnInsert: true
      })
    }))
  } catch (error) {
    console.error('保存 record 失败', error)
  }
}

async function saveReports() {
  for (const key in reportCache) {
    const [ appId, action ] = key.split('_')
    const cacheItem = reportCache[key]

    saveAction(action, appId)
    // 保存records()
    const records = formatRecoreds(cacheItem, appId, action)
    reportCache[key] = null // 将记录 format 取出来之后就清掉缓存
    saveRecords(records, appId, action)
  }
}

function formatRecoreds(item, appId, action) {
  const records = []
  for (const key in item) {
    records.push({
      appId,
      action,
      count: item[key],
      time: +key,
    })
  }
  return records
}


let autoSaveTimer

function addReport(appId, action) {
  const count = addToReportCache(appId, action)
  delayAndAutoSave()
}

function delayAndAutoSave() {
  if (autoSaveTimer) return
  autoSaveTimer = setTimeout(()=> {
    // console.log('===== save reports  =======')
    autoSaveTimer = null
    saveReports()
  }, AUTO_SAVE_DELAY)
}

function handleReport(ctx, next) {
  const { appId, action } = ctx.request.query || {}
  // TODOS: 要不要判断 appId 存在才保存
  if (appId && action) {
    addReport(appId, action)
  }
  ctx.body = 'OK'

}

async function handleSave(ctx, next) {
  const query = ctx.request.query
  const result = await RecordModel.getRecordsGroupByHour(query)
  console.log('handleSave: ', result);
  ctx.body = 'ok'
}

function formatDbQuery(query) {
  const { startTs, endTs, action, appId, type } = query
  let others ={}
  if (+type === REAL_TIME_VIEW) {
    const yesterStart = new Date(startTs - DAY).setHours(0, 0, 0, 0)
    const yesterEnd = yesterStart + DAY
    others = {
      $or: [{
        reportTime: {
          $gte: startTs,
          $lte: endTs,
        }
      }, {
        reportTime: {
          $gte: yesterStart,
          $lte: yesterEnd
        }
      }]
    }
  } else {
    others = {
      reportTime: {
        $gte: startTs,
        $lte: endTs,
      },
    }
  }
  return {
    appId, action,
    ...others
  }
}

async function handleGetRecords(ctx, next) {
  const query = ctx.request.query
  const dbQuery = formatDbQuery(query)
  const type = +query.type || 0
  let result
  if (type === REAL_TIME_VIEW) {
    result = await RecordModel.find(dbQuery, 'reportTime count')
  } else if (type === HOUR_VIEW) {
    result = await RecordModel.getRecordsGroupByHour(dbQuery)
  } else if (type === MONTH_VIEW) {
    result = await RecordModel.getRecordsGroupByDay(dbQuery)
  }
  ctx.body = result
}

function init(router) {
  router.get('/api/report', handleReport)
  router.get('/api/reports/save', handleSave)
  router.get('/api/records', handleGetRecords)
}

module.exports = {
  init
}