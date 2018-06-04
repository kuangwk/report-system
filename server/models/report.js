const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reportSchema = new Schema({
  appId: Schema.Types.ObjectId,
  action: {
    type: String, required: true
  },
  createTime: {
    type: Date,
    default: Date.now()
  }
})

reportSchema.statics.findOneOrCreate = async function (condition) {
  let result = await this.findOne(condition)
  if (!result) {
    result = await this.create(condition)
  }
  return result
}

reportSchema.statics.findActionsByAppId = async function (appId) {
  const result = await this.find({ appId })
  return result || []
}

module.exports = mongoose.model('report', reportSchema)