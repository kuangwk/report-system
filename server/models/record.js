const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recordSchema = new Schema({
  appId: String,
  action: String,
  reportTime: { type: Date, required: true },
  count: { type: Number, default: 0},
})

recordSchema.statics.getRecordsGroupByDateFormat = async function getRecordsGroupByDateFormat(query, dateToStrFormat) {
  const result = await this.aggregate([{
    $match: {
      appId: query.appId,
      action: query.action
    },
  }, {
    $project: {
      // 相关文档: https://docs.mongodb.com/manual/reference/operator/aggregation/dateToString/#format-specifiers
      dateStr: {$dateToString: {
        format: dateToStrFormat,
        date: {"$add":["$reportTime", 28800000]}, // 旧版不支持 timezone 参数
      }},
      reportTime: 1,
      count: 1
    }
  }, {
    $group: {
      _id: { dateStr: "$dateStr" },
      total: { $sum: "$count" }
    }
  }]).exec()
  return result.map((item) => {
    return {
      reportTime: new Date(item._id.dateStr),
      count: item.total
    }
  })
}

/**
 *
 * @param {Object} query
 */
recordSchema.statics.getRecordsGroupByDay = async function (query) {
  const result = await this.getRecordsGroupByDateFormat(query, "%Y-%m-%d 00:00")
  return result
}

recordSchema.statics.getRecordsGroupByHour = async function (query) {
  const result = await this.getRecordsGroupByDateFormat(query, "%Y-%m-%d %H:00")
  return result
}

module.exports = mongoose.model('record', recordSchema)