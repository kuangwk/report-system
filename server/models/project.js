const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema({
  name: { type: String, required: true}
})

const ProjectModel = mongoose.model('Project', projectSchema)

module.exports = ProjectModel